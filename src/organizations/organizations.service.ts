import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class OrganizationsService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async create(data: any, adminId: string) {
    const hashedPassword = await this.authService.hashPassword(data.bossData.password);

    return this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: data.name,
          businessType: data.businessType,
          address: data.address,
          phone: data.phone,
          email: data.email,
          createdById: adminId,
        },
      });

      const boss = await tx.user.create({
        data: {
          organizationId: org.id,
          email: data.bossData.email,
          password: hashedPassword,
          fullName: data.bossData.fullName,
          role: 'BOSS',
          createdById: adminId,
        },
      });

      return { organization: org, boss };
    });
  }

  findAll() {
    return this.prisma.organization.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findOne(id: string) {
    return this.prisma.organization.findUnique({ where: { id } });
  }

  update(id: string, data: any) {
    return this.prisma.organization.update({ where: { id }, data });
  }

  deactivate(id: string) {
    return this.prisma.organization.update({ where: { id }, data: { isActive: false } });
  }
}
