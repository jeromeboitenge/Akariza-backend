import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuthService } from '../auth/auth.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    private emailService: EmailService,
  ) {}

  async create(data: any, organizationId: string, creatorId: string) {
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
        role: data.role,
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

  findAll(organizationId: string) {
    return this.prisma.user.findMany({
      where: { organizationId },
      select: { id: true, email: true, fullName: true, role: true, isActive: true },
    });
  }

  findOne(id: string, organizationId: string) {
    return this.prisma.user.findFirst({
      where: { id, organizationId },
      select: { id: true, email: true, fullName: true, role: true, isActive: true },
    });
  }

  update(id: string, organizationId: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, fullName: true, role: true, isActive: true },
    });
  }

  deactivate(id: string, organizationId: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
