import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private prisma: PrismaService) {}

  async getSystemOverview() {
    const [
      totalOrganizations,
      activeOrganizations,
      totalBranches,
      totalUsers,
      totalProducts,
      totalSales,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.organization.count(),
      this.prisma.organization.count({ where: { isActive: true } }),
      this.prisma.branch.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.sale.count(),
      this.prisma.sale.aggregate({ _sum: { finalAmount: true } }),
    ]);

    return {
      organizations: { total: totalOrganizations, active: activeOrganizations },
      branches: totalBranches,
      users: totalUsers,
      products: totalProducts,
      sales: { count: totalSales, revenue: totalRevenue._sum.finalAmount || 0 },
    };
  }

  async getOrganizationsStats() {
    const organizations = await this.prisma.organization.findMany({
      include: {
        _count: {
          select: {
            users: true,
            branches: true,
            products: true,
            sales: true,
            purchases: true,
          },
        },
      },
    });

    const stats = await Promise.all(
      organizations.map(async (org) => {
        const [revenue, purchases] = await Promise.all([
          this.prisma.sale.aggregate({
            where: { organizationId: org.id },
            _sum: { finalAmount: true },
          }),
          this.prisma.purchase.aggregate({
            where: { organizationId: org.id },
            _sum: { finalAmount: true },
          }),
        ]);

        return {
          id: org.id,
          name: org.name,
          businessType: org.businessType,
          isActive: org.isActive,
          users: org._count.users,
          branches: org._count.branches,
          products: org._count.products,
          sales: org._count.sales,
          purchases: org._count.purchases,
          revenue: revenue._sum.finalAmount || 0,
          purchaseTotal: purchases._sum.finalAmount || 0,
          createdAt: org.createdAt,
        };
      })
    );

    return stats;
  }

  async getOrganizationDetails(organizationId: string) {
    const [org, users, branches, products, sales, purchases, recentSales] = await Promise.all([
      this.prisma.organization.findUnique({ where: { id: organizationId } }),
      this.prisma.user.findMany({
        where: { organizationId },
        select: { id: true, fullName: true, email: true, role: true, isActive: true },
      }),
      this.prisma.branch.findMany({
        where: { organizationId },
        include: { _count: { select: { users: true, sales: true } } },
      }),
      this.prisma.product.count({ where: { organizationId } }),
      this.prisma.sale.aggregate({
        where: { organizationId },
        _sum: { finalAmount: true },
        _count: true,
      }),
      this.prisma.purchase.aggregate({
        where: { organizationId },
        _sum: { finalAmount: true },
        _count: true,
      }),
      this.prisma.sale.findMany({
        where: { organizationId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { fullName: true } } },
      }),
    ]);

    return {
      organization: org,
      users,
      branches,
      stats: {
        products,
        sales: { count: sales._count, revenue: sales._sum.finalAmount || 0 },
        purchases: { count: purchases._count, total: purchases._sum.finalAmount || 0 },
      },
      recentSales,
    };
  }

  async getSalesStats(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [totalSales, salesByOrg, salesByDay] = await Promise.all([
      this.prisma.sale.aggregate({
        where,
        _sum: { finalAmount: true },
        _count: true,
      }),
      this.prisma.sale.groupBy({
        by: ['organizationId'],
        where,
        _sum: { finalAmount: true },
        _count: true,
      }),
      this.prisma.sale.groupBy({
        by: ['createdAt'],
        where,
        _sum: { finalAmount: true },
        _count: true,
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
    ]);

    const orgsWithNames = await Promise.all(
      salesByOrg.map(async (s) => ({
        organizationId: s.organizationId,
        organizationName: (await this.prisma.organization.findUnique({ where: { id: s.organizationId } }))?.name,
        sales: s._count,
        revenue: s._sum.finalAmount || 0,
      }))
    );

    return {
      total: { sales: totalSales._count, revenue: totalSales._sum.finalAmount || 0 },
      byOrganization: orgsWithNames,
      dailyTrend: salesByDay.map(d => ({
        date: d.createdAt,
        sales: d._count,
        revenue: d._sum.finalAmount || 0,
      })),
    };
  }

  async getTopProducts(limit: number) {
    const topProducts = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, total: true },
      _count: true,
      orderBy: { _sum: { total: 'desc' } },
      take: limit,
    });

    return Promise.all(
      topProducts.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          include: { organization: { select: { name: true } } },
        });
        return {
          productId: item.productId,
          name: product?.name,
          organization: product?.organization.name,
          quantitySold: item._sum.quantity || 0,
          revenue: item._sum.total || 0,
          transactions: item._count,
        };
      })
    );
  }

  async getUserActivity() {
    const [totalUsers, activeUsers, usersByRole, recentLogins] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      this.prisma.loginHistory.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      total: totalUsers,
      active: activeUsers,
      byRole: usersByRole,
      recentLogins,
    };
  }

  async getBranchesStats() {
    const branches = await this.prisma.branch.findMany({
      include: {
        organization: { select: { name: true } },
        _count: { select: { users: true, sales: true, purchases: true } },
      },
    });

    const stats = await Promise.all(
      branches.map(async (branch) => {
        const [sales, inventory] = await Promise.all([
          this.prisma.sale.aggregate({
            where: { branchId: branch.id },
            _sum: { finalAmount: true },
          }),
          this.prisma.branchInventory.count({ where: { branchId: branch.id } }),
        ]);

        return {
          id: branch.id,
          name: branch.name,
          code: branch.code,
          organization: branch.organization.name,
          isActive: branch.isActive,
          users: branch._count.users,
          products: inventory,
          sales: branch._count.sales,
          revenue: sales._sum.finalAmount || 0,
        };
      })
    );

    return stats;
  }
}
