// @ts-nocheck
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
      activeBranches,
      totalUsers,
      activeUsers,
      totalProducts,
      activeProducts,
      totalSales,
      totalRevenue,
      totalPurchases,
      totalPurchaseAmount,
      lowStockProducts,
      recentSales,
    ] = await Promise.all([
      this.prisma.organization.count(),
      this.prisma.organization.count({ where: { isActive: true } }),
      this.prisma.branch.count(),
      this.prisma.branch.count({ where: { isActive: true } }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.product.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.sale.count(),
      this.prisma.sale.aggregate({ _sum: { finalAmount: true } }),
      this.prisma.purchase.count(),
      this.prisma.purchase.aggregate({ _sum: { finalAmount: true } }),
      this.prisma.product.count({ 
        where: { 
          AND: [
            { isActive: true },
            { currentStock: { lte: this.prisma.product.fields.minStockLevel } }
          ]
        } 
      }),
      this.prisma.sale.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          organization: { select: { name: true } },
          createdBy: { select: { fullName: true } }
        }
      }),
    ]);

    // Calculate growth metrics (comparing last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [recentSalesCount, previousSalesCount, recentRevenue, previousRevenue] = await Promise.all([
      this.prisma.sale.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.sale.count({ 
        where: { 
          createdAt: { 
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo 
          } 
        } 
      }),
      this.prisma.sale.aggregate({ 
        where: { createdAt: { gte: thirtyDaysAgo } },
        _sum: { finalAmount: true } 
      }),
      this.prisma.sale.aggregate({ 
        where: { 
          createdAt: { 
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo 
          } 
        },
        _sum: { finalAmount: true } 
      }),
    ]);

    const salesGrowth = previousSalesCount > 0 
      ? ((recentSalesCount - previousSalesCount) / previousSalesCount * 100).toFixed(1)
      : '0';
    
    const revenueGrowth = (previousRevenue._sum.finalAmount || 0) > 0
      ? (((recentRevenue._sum.finalAmount || 0) - (previousRevenue._sum.finalAmount || 0)) / (previousRevenue._sum.finalAmount || 0) * 100).toFixed(1)
      : '0';

    return {
      organizations: { 
        total: totalOrganizations, 
        active: activeOrganizations,
        inactive: totalOrganizations - activeOrganizations
      },
      branches: {
        total: totalBranches,
        active: activeBranches,
        inactive: totalBranches - activeBranches
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        inactive: totalProducts - activeProducts,
        lowStock: lowStockProducts
      },
      sales: { 
        count: totalSales, 
        revenue: totalRevenue._sum.finalAmount || 0,
        growth: {
          sales: `${salesGrowth}%`,
          revenue: `${revenueGrowth}%`
        },
        recent: recentSales
      },
      purchases: {
        count: totalPurchases,
        amount: totalPurchaseAmount._sum.finalAmount || 0
      },
      systemHealth: {
        organizationHealth: activeOrganizations / Math.max(totalOrganizations, 1) * 100,
        userHealth: activeUsers / Math.max(totalUsers, 1) * 100,
        branchHealth: activeBranches / Math.max(totalBranches, 1) * 100,
        overallHealth: ((activeOrganizations / Math.max(totalOrganizations, 1)) + 
                       (activeUsers / Math.max(totalUsers, 1)) + 
                       (activeBranches / Math.max(totalBranches, 1))) / 3 * 100
      }
    };
  }

  async getOrganizationsStats() {
    const organizations = await this.prisma.organization.findMany({
      include: {
        _count: {
          select: {
            users: { where: { isActive: true } },
            branches: { where: { isActive: true } },
            products: { where: { isActive: true } },
            sales: true,
            purchases: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }
    });

    const stats = await Promise.all(
      organizations.map(async (org) => {
        const [revenue, purchases, recentActivity] = await Promise.all([
          this.prisma.sale.aggregate({
            where: { organizationId: org.id },
            _sum: { finalAmount: true },
          }),
          this.prisma.purchase.aggregate({
            where: { organizationId: org.id },
            _sum: { finalAmount: true },
          }),
          this.prisma.sale.count({
            where: { 
              organizationId: org.id,
              createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }
          })
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
          recentActivity,
          createdAt: org.createdAt,
          address: org.address,
          phone: org.phone,
          email: org.email
        };
      })
    );

    return stats.sort((a, b) => b.revenue - a.revenue);
  }

  async getOrganizationDetails(organizationId: string) {
    const [org, users, branches, products, sales, purchases, recentSales, recentPurchases] = await Promise.all([
      this.prisma.organization.findUnique({ where: { id: organizationId } }),
      this.prisma.user.findMany({
        where: { organizationId },
        select: { 
          id: true, 
          fullName: true, 
          email: true, 
          role: true, 
          isActive: true,
          createdAt: true,
          branch: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.branch.findMany({
        where: { organizationId },
        include: { 
          _count: { 
            select: { 
              users: { where: { isActive: true } }, 
              sales: true,
              purchases: true
            } 
          } 
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.product.count({ where: { organizationId, isActive: true } }),
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
        include: { 
          createdBy: { select: { fullName: true } },
          branch: { select: { name: true } }
        },
      }),
      this.prisma.purchase.findMany({
        where: { organizationId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { 
          createdBy: { select: { fullName: true } },
          supplier: { select: { name: true } }
        },
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
      recentPurchases,
    };
  }

  async getSalesStats(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [totalSales, salesByOrg, salesByDay, topCustomers] = await Promise.all([
      this.prisma.sale.aggregate({
        where,
        _sum: { finalAmount: true },
        _count: true,
        _avg: { finalAmount: true }
      }),
      this.prisma.sale.groupBy({
        by: ['organizationId'],
        where,
        _sum: { finalAmount: true },
        _count: true,
        orderBy: { _sum: { finalAmount: 'desc' } },
        take: 10
      }),
      this.prisma.sale.groupBy({
        by: ['createdAt'],
        where,
        _sum: { finalAmount: true },
        _count: true,
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      this.prisma.sale.groupBy({
        by: ['customerId'],
        where: { ...where, customerId: { not: null } },
        _sum: { finalAmount: true },
        _count: true,
        orderBy: { _sum: { finalAmount: 'desc' } },
        take: 10
      })
    ]);

    const orgsWithNames = await Promise.all(
      salesByOrg.map(async (s) => {
        const org = await this.prisma.organization.findUnique({ 
          where: { id: s.organizationId },
          select: { name: true, businessType: true }
        });
        return {
          organizationId: s.organizationId,
          organizationName: org?.name || 'Unknown',
          businessType: org?.businessType,
          sales: s._count,
          revenue: s._sum.finalAmount || 0,
        };
      })
    );

    return {
      total: { 
        sales: totalSales._count, 
        revenue: totalSales._sum.finalAmount || 0,
        averageOrderValue: totalSales._avg.finalAmount || 0
      },
      byOrganization: orgsWithNames,
      dailyTrend: salesByDay.map(d => ({
        date: d.createdAt,
        sales: d._count,
        revenue: d._sum.finalAmount || 0,
      })),
      topCustomers: topCustomers.length
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
          include: { 
            organization: { select: { name: true } },
            _count: { select: { saleItems: true } }
          },
        });
        return {
          productId: item.productId,
          name: product?.name || 'Unknown Product',
          category: product?.category,
          organization: product?.organization.name,
          quantitySold: item._sum.quantity || 0,
          revenue: item._sum.total || 0,
          transactions: item._count,
          currentStock: product?.currentStock || 0,
          sellingPrice: product?.sellingPrice || 0
        };
      })
    );
  }

  async getUserActivity() {
    const [totalUsers, activeUsers, usersByRole, recentLogins, usersByOrg] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
        where: { isActive: true }
      }),
      this.prisma.loginHistory.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { 
            select: { 
              fullName: true, 
              email: true, 
              role: true,
              organization: { select: { name: true } }
            } 
          }
        }
      }),
      this.prisma.user.groupBy({
        by: ['organizationId'],
        _count: true,
        where: { isActive: true },
        orderBy: { _count: { _all: 'desc' } },
        take: 10
      })
    ]);

    const orgsWithUserCounts = await Promise.all(
      usersByOrg.map(async (item) => {
        const org = await this.prisma.organization.findUnique({
          where: { id: item.organizationId },
          select: { name: true }
        });
        return {
          organizationId: item.organizationId,
          organizationName: org?.name || 'Unknown',
          userCount: item._count
        };
      })
    );

    return {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
      byRole: usersByRole,
      byOrganization: orgsWithUserCounts,
      recentLogins: recentLogins.map(login => ({
        ...login,
        user: {
          fullName: login.user?.fullName,
          email: login.user?.email,
          role: login.user?.role,
          organization: login.user?.organization?.name
        }
      })),
    };
  }

  async getBranchesStats() {
    const branches = await this.prisma.branch.findMany({
      include: {
        organization: { select: { name: true, businessType: true } },
        _count: { 
          select: { 
            users: { where: { isActive: true } }, 
            sales: true, 
            purchases: true 
          } 
        },
      },
      orderBy: { createdAt: 'desc' }
    });

    const stats = await Promise.all(
      branches.map(async (branch) => {
        const [sales, inventory, recentActivity] = await Promise.all([
          this.prisma.sale.aggregate({
            where: { branchId: branch.id },
            _sum: { finalAmount: true },
          }),
          this.prisma.branchInventory.count({ where: { branchId: branch.id } }),
          this.prisma.sale.count({
            where: { 
              branchId: branch.id,
              createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }
          })
        ]);

        return {
          id: branch.id,
          name: branch.name,
          code: branch.code,
          address: branch.address,
          phone: branch.phone,
          organization: branch.organization.name,
          businessType: branch.organization.businessType,
          isActive: branch.isActive,
          isMainBranch: branch.isMainBranch,
          users: branch._count.users,
          products: inventory,
          sales: branch._count.sales,
          purchases: branch._count.purchases,
          revenue: sales._sum.finalAmount || 0,
          recentActivity,
          createdAt: branch.createdAt
        };
      })
    );

    return stats.sort((a, b) => b.revenue - a.revenue);
  }

  async getSystemHealth() {
    const [
      dbHealth,
      apiHealth,
      errorLogs,
      systemLoad
    ] = await Promise.all([
      this.checkDatabaseHealth(),
      this.checkApiHealth(),
      this.getRecentErrors(),
      this.getSystemLoad()
    ]);

    return {
      database: dbHealth,
      api: apiHealth,
      errors: errorLogs,
      load: systemLoad,
      overall: this.calculateOverallHealth(dbHealth, apiHealth, errorLogs, systemLoad)
    };
  }

  private async checkDatabaseHealth() {
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;
      
      return {
        status: 'healthy',
        responseTime,
        connections: 'active'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        responseTime: null
      };
    }
  }

  private async checkApiHealth() {
    // This would typically check external API dependencies
    return {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  }

  private async getRecentErrors() {
    // This would typically fetch from error logging system
    return {
      count: 0,
      recent: []
    };
  }

  private async getSystemLoad() {
    return {
      cpu: 'normal',
      memory: 'normal',
      disk: 'normal'
    };
  }

  private calculateOverallHealth(db: any, api: any, errors: any, load: any) {
    let score = 100;
    
    if (db.status !== 'healthy') score -= 30;
    if (api.status !== 'healthy') score -= 20;
    if (errors.count > 10) score -= 20;
    if (load.cpu === 'high') score -= 15;
    if (load.memory === 'high') score -= 15;
    
    return Math.max(0, score);
  }
}
