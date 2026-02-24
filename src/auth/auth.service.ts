import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateAccessToken(payload: any): string {
    return this.jwtService.sign(payload);
  }

  generateRefreshToken(payload: any): string {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });
  }

  async adminLogin(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin || !admin.isActive) throw new UnauthorizedException('Invalid credentials');

    const isValid = await this.comparePassword(password, admin.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: admin.id, role: admin.role, type: 'admin' };
    return {
      user: { id: admin.id, email: admin.email, fullName: admin.fullName, role: admin.role },
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  async userLogin(email: string, password: string) {
    const user = await this.prisma.user.findFirst({ where: { email, isActive: true } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await this.comparePassword(password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, organizationId: user.organizationId, role: user.role, type: 'user' };
    const refreshToken = this.generateRefreshToken(payload);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organizationId: user.organizationId,
      },
      accessToken: this.generateAccessToken(payload),
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_REFRESH_SECRET });
      return {
        accessToken: this.generateAccessToken({
          sub: payload.sub,
          organizationId: payload.organizationId,
          role: payload.role,
          type: payload.type,
        }),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
