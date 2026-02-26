import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
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

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async login(email: string, password: string) {
    // Try user login first
    const user = await this.prisma.user.findFirst({ where: { email, isActive: true } });
    if (user) {
      const isValid = await this.comparePassword(password, user.password);
      if (!isValid) throw new UnauthorizedException('Invalid credentials');

      // Generate OTP
      const otpCode = this.generateOtp();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      await this.prisma.user.update({
        where: { id: user.id },
        data: { otpCode, otpExpiry },
      });

      // Send OTP email
      try {
        await this.emailService.sendOtpEmail(user.email, user.fullName, otpCode);
      } catch (error) {
        console.error('Failed to send OTP email:', error);
        throw new UnauthorizedException('Failed to send OTP. Please try again.');
      }

      return {
        message: 'OTP sent to your email',
        requiresOtp: true,
        userId: user.id,
      };
    }

    // Try admin login (no OTP for admin)
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (admin && admin.isActive) {
      const isValid = await this.comparePassword(password, admin.password);
      if (!isValid) throw new UnauthorizedException('Invalid credentials');

      const payload = { sub: admin.id, role: admin.role, type: 'admin' };
      return {
        user: { id: admin.id, email: admin.email, fullName: admin.fullName, role: admin.role },
        accessToken: this.generateAccessToken(payload),
        refreshToken: this.generateRefreshToken(payload),
      };
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async verifyOtp(userId: string, otpCode: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.otpCode || !user.otpExpiry) {
      throw new UnauthorizedException('No OTP found. Please login again.');
    }

    if (new Date() > user.otpExpiry) {
      throw new UnauthorizedException('OTP expired. Please login again.');
    }

    if (user.otpCode !== otpCode) {
      throw new UnauthorizedException('Invalid OTP code');
    }

    // OTP is valid, generate tokens
    const payload = { 
      sub: user.id, 
      organizationId: user.organizationId, 
      branchId: user.branchId,
      role: user.role, 
      type: 'user' 
    };
    const refreshToken = this.generateRefreshToken(payload);

    // Clear OTP and save refresh token
    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        otpCode: null, 
        otpExpiry: null,
        refreshToken 
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organizationId: user.organizationId,
        branchId: user.branchId,
      },
      accessToken: this.generateAccessToken(payload),
      refreshToken,
    };
  }

  async adminLogin(email: string, password: string) {
    return this.login(email, password);
  }

  async userLogin(email: string, password: string) {
    return this.login(email, password);
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_REFRESH_SECRET });
      return {
        accessToken: this.generateAccessToken({
          sub: payload.sub,
          organizationId: payload.organizationId,
          branchId: payload.branchId,
          role: payload.role,
          type: payload.type,
        }),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
