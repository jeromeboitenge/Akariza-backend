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

  async testEmailService(email: string) {
    try {
      console.log('🧪 Testing email service for:', email);
      console.log('📧 SendGrid API Key:', process.env.SENDGRID_API_KEY ? 'Set ✅' : 'Missing ❌');
      console.log('📧 From Email:', process.env.SENDGRID_FROM_EMAIL || 'Missing ❌');
      
      const testOtp = this.generateOtp();
      const result = await this.emailService.sendOtpEmail(email, 'Test User', testOtp);
      
      return {
        success: result.success,
        message: result.message,
        testOtp: process.env.NODE_ENV === 'development' ? testOtp : 'Hidden in production',
        config: {
          apiKeySet: !!process.env.SENDGRID_API_KEY,
          fromEmail: process.env.SENDGRID_FROM_EMAIL,
        }
      };
    } catch (error) {
      console.error('❌ Test email error:', error);
      return {
        success: false,
        error: error.message,
        config: {
          apiKeySet: !!process.env.SENDGRID_API_KEY,
          fromEmail: process.env.SENDGRID_FROM_EMAIL,
        }
      };
    }
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

      // Generate tokens directly without OTP
      const payload = { 
        sub: user.id, 
        organizationId: user.organizationId, 
        branchId: user.branchId,
        role: user.role, 
        type: 'user' 
      };
      
      const refreshToken = this.generateRefreshToken(payload);

      // Save refresh token
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      const userData = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organizationId: user.organizationId,
        branchId: user.branchId,
      };

      return {
        user: userData,
        accessToken: this.generateAccessToken(payload),
        refreshToken,
      };
    }

    // Try admin login
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

      // Generate tokens directly without OTP
      const payload = { 
        sub: admin.id, 
        role: admin.role, 
        type: 'admin' 
      };

      const userData = {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      };

      return {
        user: userData,
        accessToken: this.generateAccessToken(payload),
        refreshToken: this.generateRefreshToken(payload),
      };
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async verifyOtp(email: string, otpCode: string) {
    // Try user first
    let user: any = await this.prisma.user.findFirst({ where: { email } });
    let userType = 'user';
    
    // If not found, try admin
    if (!user) {
      user = await this.prisma.admin.findUnique({ where: { email } });
      userType = 'admin';
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

  async forgotPassword(email: string) {
    // Try user first
    let user: any = await this.prisma.user.findFirst({ where: { email } });
    let userType = 'user';
    
    // If not found, try admin
    if (!user) {
      user = await this.prisma.admin.findUnique({ where: { email } });
      userType = 'admin';
    }
    
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If email exists, OTP has been sent' };
    }

    // Generate OTP
    const otpCode = this.generateOtp();
    const otpExpiry = DateUtil.addMinutes(new Date(), SECURITY.OTP_EXPIRY_MINUTES);

    // Save OTP
    if (userType === 'admin') {
      await this.prisma.admin.update({
        where: { id: user.id },
        data: { otpCode, otpExpiry },
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { otpCode, otpExpiry },
      });
    }

    // Log OTP in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Password Reset OTP for', email, ':', otpCode);
    }

    // Send OTP email
    try {
      await this.emailService.sendPasswordResetEmail(email, user.fullName, otpCode);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }

    return { 
      message: 'If email exists, OTP has been sent',
      otp: process.env.NODE_ENV === 'development' ? otpCode : undefined
    };
  }

  async verifyPasswordResetOtp(email: string, otpCode: string) {
    // Try user first
    let user: any = await this.prisma.user.findFirst({ where: { email } });
    let userType = 'user';
    
    // If not found, try admin
    if (!user) {
      user = await this.prisma.admin.findUnique({ where: { email } });
      userType = 'admin';
    }
    
    if (!user) {
      throw new UnauthorizedException('Invalid OTP');
    }

    if (!user.otpCode || !user.otpExpiry) {
      throw new UnauthorizedException('No OTP found. Please request password reset again.');
    }

    if (new Date() > user.otpExpiry) {
      throw new UnauthorizedException('OTP expired. Please request password reset again.');
    }

    if (user.otpCode !== otpCode) {
      throw new UnauthorizedException('Invalid OTP code');
    }

    // OTP is valid, return success
    return { 
      message: 'OTP verified. You can now reset your password.',
      email,
      verified: true
    };
  }

  async resetPassword(email: string, otpCode: string, newPassword: string) {
    // Verify OTP first
    await this.verifyPasswordResetOtp(email, otpCode);

    // Validate password strength
    const validation = this.validatePasswordStrength(newPassword);
    if (!validation.valid) {
      throw new UnauthorizedException(validation.message);
    }

    // Try user first
    let user: any = await this.prisma.user.findFirst({ where: { email } });
    let userType = 'user';
    
    // If not found, try admin
    if (!user) {
      user = await this.prisma.admin.findUnique({ where: { email } });
      userType = 'admin';
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update password and clear OTP
    if (userType === 'admin') {
      await this.prisma.admin.update({
        where: { id: user.id },
        data: { 
          password: hashedPassword,
          otpCode: null,
          otpExpiry: null,
          failedLoginAttempts: 0,
          lockedUntil: null
        },
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { 
          password: hashedPassword,
          otpCode: null,
          otpExpiry: null,
          failedLoginAttempts: 0,
          lockedUntil: null
        },
      });
    }

    return { message: 'Password reset successfully. You can now login.' };
  }
}
