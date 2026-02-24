import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async create(data: any, organizationId: string, creatorId: string) {
    const hashedPassword = await this.authService.hashPassword(data.password);
    return this.prisma.user.create({
      data: {
        organizationId,
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        role: data.role,
        createdById: creatorId,
      },
      select: { id: true, email: true, fullName: true, role: true, isActive: true },
    });
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
