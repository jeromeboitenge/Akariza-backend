import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';
import { EmailService } from '../email/email.service';
import { ValidationUtil } from '../common/validation.util';
import { NumberUtil } from '../common/number.util';
import { DateUtil } from '../common/date.util';
import { SECURITY } from '../common/constants';
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
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || SECURITY.JWT_REFRESH_EXPIRY,
    });
  }

  generateOtp(): string {
    return NumberUtil.generateOTP(6);
  }

  validatePasswordStrength(password: string): { valid: boolean; message?: string } {
    return ValidationUtil.isStrongPassword(password);
  }

  async login(email: string, password: string) {
    // Try user login first
    const user = await this.prisma.user.findFirst({ where: { email, isActive: true } });
    if (user) {
      // Check if account is locked
      if (user.lockedUntil && new Date() < user.lockedUntil) {
        const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
        throw new UnauthorizedException(`Account locked. Try again in ${minutesLeft} minutes.`);
      }

      const isValid = await this.comparePassword(password, user.password);
      
      if (!isValid) {
        // Increment failed attempts
        const failedAttempts = user.failedLoginAttempts + 1;
        const updateData: any = { failedLoginAttempts: failedAttempts };

        // Lock account after 5 failed attempts for 30 minutes
        if (failedAttempts >= 5) {
          updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
          await this.prisma.user.update({
            where: { id: user.id },
            data: updateData,
          });
          throw new UnauthorizedException('Account locked due to multiple failed login attempts. Try again in 30 minutes.');
        }

        await this.prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });

        throw new UnauthorizedException(`Invalid credentials. ${5 - failedAttempts} attempts remaining.`);
      }

      // Reset failed attempts on successful login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });

      // Generate OTP
      const otpCode = this.generateOtp();
      const otpExpiry = DateUtil.addMinutes(new Date(), SECURITY.OTP_EXPIRY_MINUTES);

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

    // Try admin login - also requires OTP
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (admin && admin.isActive) {
      // Check if account is locked
      if (admin.lockedUntil && new Date() < admin.lockedUntil) {
        const minutesLeft = Math.ceil((admin.lockedUntil.getTime() - Date.now()) / 60000);
        throw new UnauthorizedException(`Account locked. Try again in ${minutesLeft} minutes.`);
      }

      const isValid = await this.comparePassword(password, admin.password);
      
      if (!isValid) {
        // Increment failed attempts
        const failedAttempts = admin.failedLoginAttempts + 1;
        const updateData: any = { failedLoginAttempts: failedAttempts };

        // Lock account after 5 failed attempts for 30 minutes
        if (failedAttempts >= 5) {
          updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
          await this.prisma.admin.update({
            where: { id: admin.id },
            data: updateData,
          });
          throw new UnauthorizedException('Account locked due to multiple failed login attempts. Try again in 30 minutes.');
        }

        await this.prisma.admin.update({
          where: { id: admin.id },
          data: updateData,
        });

        throw new UnauthorizedException(`Invalid credentials. ${5 - failedAttempts} attempts remaining.`);
      }

      // Reset failed attempts on successful login
      await this.prisma.admin.update({
        where: { id: admin.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });

      // Generate OTP for admin too
      const otpCode = this.generateOtp();
      const otpExpiry = DateUtil.addMinutes(new Date(), SECURITY.OTP_EXPIRY_MINUTES);

      await this.prisma.admin.update({
        where: { id: admin.id },
        data: { otpCode, otpExpiry },
      });

      // Send OTP email
      try {
        await this.emailService.sendOtpEmail(admin.email, admin.fullName, otpCode);
      } catch (error) {
        console.error('Failed to send OTP email:', error);
        throw new UnauthorizedException('Failed to send OTP. Please try again.');
      }

      return {
        message: 'OTP sent to your email',
        requiresOtp: true,
        userId: admin.id,
        userType: 'admin',
      };
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async verifyOtp(userId: string, otpCode: string, userType: string = 'user') {
    let user: any;
    
    if (userType === 'admin') {
      user = await this.prisma.admin.findUnique({ where: { id: userId } });
    } else {
      user = await this.prisma.user.findUnique({ where: { id: userId } });
    }
    
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
    let payload: any;
    let userData: any;

    if (userType === 'admin') {
      payload = { 
        sub: user.id, 
        role: user.role, 
        type: 'admin' 
      };
      
      // Clear OTP for admin
      await this.prisma.admin.update({
        where: { id: user.id },
        data: { 
          otpCode: null, 
          otpExpiry: null,
        },
      });

      userData = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      };
    } else {
      payload = { 
        sub: user.id, 
        organizationId: user.organizationId, 
        branchId: user.branchId,
        role: user.role, 
        type: 'user' 
      };
      
      const refreshToken = this.generateRefreshToken(payload);

      // Clear OTP and save refresh token for user
      await this.prisma.user.update({
        where: { id: user.id },
        data: { 
          otpCode: null, 
          otpExpiry: null,
          refreshToken 
        },
      });

      userData = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organizationId: user.organizationId,
        branchId: user.branchId,
      };
    }

    return {
      user: userData,
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
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
