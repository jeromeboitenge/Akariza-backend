import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuthService } from '../auth/auth.service';
import { EmailService } from '../email/email.service';
import { DateUtil } from '../common/date.util';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    private emailService: EmailService,
  ) {}

  async create(data: any, organizationId: string, creatorId: string) {
    // Get creator info to check role and branch
    const creator = await this.prisma.user.findUnique({
      where: { id: creatorId },
      select: { role: true, branchId: true }
    });

    if (!creator) {
      throw new Error('Creator user not found');
    }

    // MANAGER can only create users for their own branch
    if (creator.role === 'MANAGER') {
      if (!data.branchId || data.branchId !== creator.branchId) {
        throw new Error('Managers can only create users for their own branch');
      }
      // MANAGER can only create CASHIER role
      if (data.role && data.role !== 'CASHIER') {
        throw new Error('Managers can only create CASHIER users');
      }
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findFirst({
      where: { email: data.email }
    });
    if (existingUser) {
      throw new Error('Email already exists in the system');
    }

    // Validate password strength
    const passwordValidation = this.authService.validatePasswordStrength(data.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    const hashedPassword = await this.authService.hashPassword(data.password);
    const user = await this.prisma.user.create({
      data: {
        organizationId,
        branchId: data.branchId,
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        role: data.role || 'CASHIER',
        createdById: creatorId,
        passwordHistory: [hashedPassword],
      },
      select: { id: true, email: true, fullName: true, role: true, isActive: true },
    });

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(
        user.email,
        user.fullName,
        user.role,
        data.password
      );
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't fail user creation if email fails
    }

    return user;
  }

  async findAll(organizationId?: string, userRole?: string, userBranchId?: string) {
    console.log('🔍 findAll called with:', { organizationId, userRole, userBranchId });
    
    let where: any = {};
    
    if (organizationId) {
      where.organizationId = organizationId;
    }
    
    // Managers only see users in their branch
    if (userRole === 'MANAGER' && userBranchId) {
      where.branchId = userBranchId;
    }
    
    console.log('🔍 Query where clause:', where);
    
    const users = await this.prisma.user.findMany({
      where,
      select: { 
        id: true, 
        email: true, 
        fullName: true, 
        role: true, 
        isActive: true,
        organizationId: true,
        branchId: true,
        createdAt: true,
      },
    });
    
    console.log('📊 Query returned users:', users.length);
    return users;
  }

  findOne(id: string, organizationId?: string) {
    return this.prisma.user.findFirst({
      where: organizationId ? { id, organizationId } : { id },
      select: { id: true, email: true, fullName: true, role: true, isActive: true },
    });
  }

  async update(id: string, organizationId: string | undefined, data: any) {
    // If organizationId is provided (BOSS), verify user belongs to that org
    if (organizationId) {
      const user = await this.prisma.user.findFirst({
        where: { id, organizationId },
      });
      if (!user) {
        throw new Error('User not found in your organization');
      }
    }
    
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, fullName: true, role: true, isActive: true },
    });
  }

  async deactivate(id: string, organizationId: string | undefined) {
    if (organizationId) {
      const user = await this.prisma.user.findFirst({ where: { id, organizationId } });
      if (!user) throw new Error('User not found in your organization');
    }
    return this.prisma.user.update({ where: { id }, data: { isActive: false } });
  }

  async assignRole(userId: string, newRole: string, callerRole: string, callerOrgId: string | undefined) {
    const VALID_ROLES = ['SYSTEM_ADMIN', 'BOSS', 'MANAGER', 'CASHIER'];
    if (!VALID_ROLES.includes(newRole)) {
      throw new Error(`Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`);
    }

    // Only SYSTEM_ADMIN can assign BOSS or SYSTEM_ADMIN roles
    if ((newRole === 'SYSTEM_ADMIN' || newRole === 'BOSS') && callerRole !== 'SYSTEM_ADMIN') {
      throw new Error('Only SYSTEM_ADMIN can assign BOSS or SYSTEM_ADMIN roles');
    }

    // Verify target user exists and (for BOSS callers) belongs to their org
    const where: any = callerOrgId && callerRole !== 'SYSTEM_ADMIN'
      ? { id: userId, organizationId: callerOrgId }
      : { id: userId };

    const user = await this.prisma.user.findFirst({ where });
    if (!user) throw new Error('User not found or outside your organization');

    // Prevent downgrading a SYSTEM_ADMIN by a non-SYSTEM_ADMIN
    if (user.role === 'SYSTEM_ADMIN' && callerRole !== 'SYSTEM_ADMIN') {
      throw new Error('Only SYSTEM_ADMIN can modify another SYSTEM_ADMIN');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole as any },
      select: { id: true, email: true, fullName: true, role: true, isActive: true },
    });
  }

  async setStatus(userId: string, isActive: boolean, callerRole: string, callerOrgId: string | undefined) {
    const where: any = callerOrgId && callerRole !== 'SYSTEM_ADMIN'
      ? { id: userId, organizationId: callerOrgId }
      : { id: userId };

    const user = await this.prisma.user.findFirst({ where });
    if (!user) throw new Error('User not found or outside your organization');
    if (user.role === 'SYSTEM_ADMIN' && callerRole !== 'SYSTEM_ADMIN') {
      throw new Error('Cannot change status of a SYSTEM_ADMIN');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, email: true, fullName: true, role: true, isActive: true },
    });
  }

  getAvailableRoles() {
    const roles = ['SYSTEM_ADMIN', 'BOSS', 'MANAGER', 'CASHIER'];
    const matrix: Record<string, Record<string, string>> = {
      SYSTEM_ADMIN: { Dashboard:'Full Platform',Organizations:'Full',Users:'Full',Roles:'Full',Products:'Full',Sales:'Full',Purchases:'Full',Stock:'Full',Reports:'Full',Analytics:'Full',Expenses:'Full',Suppliers:'Full',Customers:'Full',Tasks:'Full',Messages:'Full',Settings:'Full' },
      BOSS:        { Dashboard:'Org Overview',  Organizations:'None', Users:'Org',  Roles:'Org',  Products:'Full',Sales:'Full',Purchases:'Full',Stock:'Full',Reports:'Org', Analytics:'Org', Expenses:'Full',Suppliers:'Full',Customers:'Full',Tasks:'Full',Messages:'Full',Settings:'Org' },
      MANAGER:     { Dashboard:'Branch',        Organizations:'None', Users:'View', Roles:'View', Products:'Full',Sales:'Full',Purchases:'Full',Stock:'Full',Reports:'Branch',Analytics:'Branch',Expenses:'Full',Suppliers:'Full',Customers:'Full',Tasks:'Full',Messages:'Full',Settings:'None' },
      CASHIER:     { Dashboard:'Personal',      Organizations:'None', Users:'None', Roles:'None', Products:'View',Sales:'Create',Purchases:'None',Stock:'View',Reports:'None',Analytics:'None', Expenses:'None',Suppliers:'None',Customers:'View', Tasks:'Own', Messages:'Full',Settings:'None' },
    };
    return { roles, matrix };
  }

  async requestPasswordChangeOtp(userId: string) {
    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate OTP
    const otpCode = this.authService.generateOtp();
    const otpExpiry = DateUtil.addMinutes(new Date(), 5);

    // Save OTP
    await this.prisma.user.update({
      where: { id: userId },
      data: { otpCode, otpExpiry },
    });

    // Log OTP in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Password Change OTP for', user.email, ':', otpCode);
    }

    // Send OTP email
    try {
      await this.emailService.sendPasswordChangeOtpEmail(user.email, user.fullName, otpCode);
    } catch (error) {
      console.error('Failed to send password change OTP email:', error);
    }

    return { 
      message: 'OTP sent to your email',
      otp: process.env.NODE_ENV === 'development' ? otpCode : undefined
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string, otpCode: string) {
    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValid = await this.authService.comparePassword(currentPassword, user.password);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Verify OTP
    if (!user.otpCode || !user.otpExpiry) {
      throw new Error('No OTP found. Please request OTP first.');
    }

    if (new Date() > user.otpExpiry) {
      throw new Error('OTP expired. Please request a new OTP.');
    }

    if (user.otpCode !== otpCode) {
      throw new Error('Invalid OTP code');
    }

    // Validate new password strength
    const validation = this.authService.validatePasswordStrength(newPassword);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    // Check password history (prevent reuse of last 3 passwords)
    const passwordHistory = user.passwordHistory || [];
    for (const oldHash of passwordHistory.slice(-3)) {
      const isReused = await this.authService.comparePassword(newPassword, oldHash);
      if (isReused) {
        throw new Error('Cannot reuse recent passwords');
      }
    }

    // Hash new password
    const hashedPassword = await this.authService.hashPassword(newPassword);

    // Update password and history, clear OTP
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordHistory: [...passwordHistory, hashedPassword].slice(-5), // Keep last 5
        lastPasswordChange: new Date(),
        otpCode: null,
        otpExpiry: null,
      },
    });

    return { message: 'Password changed successfully' };
  }

  async resetPassword(userId: string, organizationId: string | undefined, newPassword: string) {
    // Verify user belongs to organization (if BOSS)
    if (organizationId) {
      const user = await this.prisma.user.findFirst({
        where: { id: userId, organizationId },
      });
      if (!user) {
        throw new Error('User not found in your organization');
      }
    }

    // Validate password strength
    const validation = this.authService.validatePasswordStrength(newPassword);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    // Hash password
    const hashedPassword = await this.authService.hashPassword(newPassword);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordHistory: [hashedPassword],
        lastPasswordChange: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Send email notification
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, fullName: true },
    });

    if (user) {
      await this.emailService.sendEmail(
        user.email,
        'Password Reset - Akariza',
        this.generatePasswordResetEmail(user.fullName, newPassword)
      ).catch(err => console.error('Email failed:', err));
    }

    return { message: 'Password reset successfully' };
  }

  private generatePasswordResetEmail(name: string, tempPassword: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; background: white; }
          .header { background: #2563eb; padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { padding: 40px 30px; }
          .password { background: #f8fafc; border: 2px solid #2563eb; padding: 20px; text-align: center; font-size: 24px; font-family: monospace; margin: 20px 0; }
          .warning { background: #fff7ed; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; color: #666; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Your password has been reset by your administrator.</p>
            <p><strong>Your new temporary password:</strong></p>
            <div class="password">${tempPassword}</div>
            <div class="warning">
              <strong>⚠️ Important:</strong> Please change this password immediately after logging in.
            </div>
          </div>
          <div class="footer">
            <p>Akariza Stock Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
