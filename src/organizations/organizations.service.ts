import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class OrganizationsService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async create(data: any, adminId: string) {
    // Check if organization already exists by name, email, or phone
    const existing = await this.prisma.organization.findFirst({
      where: {
        OR: [
          { name: data.name },
          { email: data.email },
          { phone: data.phone },
        ],
      },
    });

    if (existing) {
      if (existing.name === data.name) {
        throw new ConflictException('Organization with this name already exists');
      }
      if (existing.email === data.email) {
        throw new ConflictException('Organization with this email already exists');
      }
      if (existing.phone === data.phone) {
        throw new ConflictException('Organization with this phone already exists');
      }
    }

    // Check if boss email already exists
    const existingUser = await this.prisma.user.findFirst({
      where: { email: data.bossData.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

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
        },
      });

      return { organization: org, boss };
    });
  }

  async findAll() {
    return this.prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            users: true,
            products: true,
            sales: true,
            purchases: true,
            branches: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            isActive: true,
          },
        },
        branches: true,
        _count: {
          select: {
            products: true,
            sales: true,
            purchases: true,
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  async update(id: string, data: any) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.organization.update({
      where: { id },
      data: {
        name: data.name,
        businessType: data.businessType,
        address: data.address,
        phone: data.phone,
        email: data.email,
      },
    });
  }

  async deactivate(id: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.organization.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async activate(id: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.organization.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async getStats(id: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const [users, products, sales, purchases, branches] = await Promise.all([
      this.prisma.user.count({ where: { organizationId: id } }),
      this.prisma.product.count({ where: { organizationId: id } }),
      this.prisma.sale.count({ where: { organizationId: id } }),
      this.prisma.purchase.count({ where: { organizationId: id } }),
      this.prisma.branch.count({ where: { organizationId: id } }),
    ]);

    const totalSales = await this.prisma.sale.aggregate({
      where: { organizationId: id },
      _sum: { finalAmount: true },
    });

    return {
      organization: org,
      stats: {
        users,
        products,
        sales,
        purchases,
        branches,
        totalRevenue: totalSales._sum.finalAmount || 0,
      },
    };
  }
}
