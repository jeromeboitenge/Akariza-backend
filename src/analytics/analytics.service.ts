import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(organizationId: string, branchId?: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      todaySales,
      monthSales,
      yearSales,
      lowStockProducts,
      topProducts,
      recentSales,
      pendingPayments,
      cashierPerformance,
      branchesCount,
      employeesCount,
      customersCount,
      productsCount,
      totalRevenue,
      totalExpenses,
      totalPurchases,
    ] = await Promise.all([
      // Today's sales
      this.prisma.sale.aggregate({
        where: {
          organizationId,
          ...(branchId && { branchId }),
          createdAt: { gte: startOfDay },
        },
        _sum: { totalAmount: true },
        _count: true,
      }),

      // Month sales
      this.prisma.sale.aggregate({
        where: {
          organizationId,
          ...(branchId && { branchId }),
          createdAt: { gte: startOfMonth },
        },
        _sum: { totalAmount: true },
        _count: true,
      }),

      // Year sales
      this.prisma.sale.aggregate({
        where: {
          organizationId,
          ...(branchId && { branchId }),
          createdAt: { gte: startOfYear },
        },
        _sum: { totalAmount: true },
      }),

      // Low stock products
      this.prisma.product.findMany({
        where: {
          organizationId,
          isActive: true,
          currentStock: { lte: this.prisma.product.fields.minStockLevel },
        },
        select: {
          id: true,
          name: true,
          sku: true,
          currentStock: true,
          minStockLevel: true,
        },
        take: 10,
      }),

      // Top 5 products today
      this.prisma.saleItem.groupBy({
        by: ['productId'],
        where: {
          sale: {
            organizationId,
            ...(branchId && { branchId }),
            createdAt: { gte: startOfDay },
          },
        },
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { total: 'desc' } },
        take: 5,
      }),

      // Recent 5 sales
      this.prisma.sale.findMany({
        where: {
          organizationId,
          ...(branchId && { branchId }),
        },
        select: {
          id: true,
          saleNumber: true,
          totalAmount: true,
          paymentMethod: true,
          customerName: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Pending payments (credit sales)
      this.prisma.sale.aggregate({
        where: {
          organizationId,
          paymentStatus: 'UNPAID',
        },
        _sum: { totalAmount: true },
        _count: true,
      }),

      // Cashier performance today
      this.prisma.sale.groupBy({
        by: ['createdById'],
        where: {
          organizationId,
          ...(branchId && { branchId }),
          createdAt: { gte: startOfDay },
        },
        _sum: { totalAmount: true },
        _count: true,
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: 5,
      }),

      // Branches count
      this.prisma.branch.count({
        where: { organizationId, isActive: true },
      }),

      // Employees count (exclude BOSS role)
      this.prisma.user.count({
        where: { 
          organizationId, 
          isActive: true,
          role: { not: 'BOSS' },
        },
      }),

      // Customers count
      this.prisma.customer.count({
        where: { organizationId, isActive: true },
      }),

      // Products count
      this.prisma.product.count({
        where: { organizationId, isActive: true },
      }),

      // Total revenue (all-time)
      this.prisma.sale.aggregate({
        where: { organizationId },
        _sum: { totalAmount: true },
        _count: true,
      }),

      // Total expenses
      this.prisma.expense.aggregate({
        where: { organizationId },
        _sum: { amount: true },
      }),

      // Total purchases
      this.prisma.purchase.aggregate({
        where: { organizationId },
        _sum: { totalAmount: true },
      }),
    ]);

    // Get product names for top products
    const productIds = topProducts.map(p => p.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true },
    });

    // Get user names for cashier performance
    const userIds = cashierPerformance.map(c => c.createdById);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, fullName: true, role: true },
    });

    // Calculate today's profit (simple estimation: revenue - expenses for today)
    const todayExpenses = await this.prisma.expense.aggregate({
      where: {
        organizationId,
        date: { gte: startOfDay },
      },
      _sum: { amount: true },
    });

    const todayProfit = (todaySales._sum.totalAmount || 0) - (todayExpenses._sum.amount || 0);

    return {
      summary: {
        todaySales: todaySales._sum.totalAmount || 0,
        todayProfit: todayProfit,
        todayTransactions: todaySales._count,
        monthSales: monthSales._sum.totalAmount || 0,
        monthTransactions: monthSales._count,
        yearSales: yearSales._sum.totalAmount || 0,
        lowStockCount: lowStockProducts.length,
        pendingPayments: pendingPayments._sum.totalAmount || 0,
        pendingPaymentsCount: pendingPayments._count,
        totalBranches: branchesCount,
        totalEmployees: employeesCount,
        totalCustomers: customersCount,
        totalProducts: productsCount,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalSales: totalRevenue._count || 0,
        totalExpenses: totalExpenses._sum.amount || 0,
        totalPurchases: totalPurchases._sum.totalAmount || 0,
      },
      lowStockProducts,
      topProductsToday: topProducts.map(p => {
        const product = products.find(pr => pr.id === p.productId);
        return {
          productId: p.productId,
          productName: product?.name,
          sku: product?.sku,
          quantitySold: p._sum.quantity,
          revenue: p._sum.total,
        };
      }),
      recentSales,
      cashierPerformance: cashierPerformance.map(c => {
        const user = users.find(u => u.id === c.createdById);
        return {
          userId: c.createdById,
          userName: user?.fullName,
          role: user?.role,
          sales: c._sum.totalAmount || 0,
          transactions: c._count,
        };
      }),
    };
  }

  async getSalesTrends(organizationId: string, period: 'daily' | 'weekly' | 'monthly' = 'daily', days: number = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sales = await this.prisma.sale.findMany({
      where: {
        organizationId,
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    // Group by date
    const grouped = sales.reduce((acc, sale) => {
      const date = sale.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, sales: 0, count: 0 };
      }
      acc[date].sales += sale.totalAmount;
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, { date: string; sales: number; count: number }>);

    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getTopProducts(organizationId: string, limit: number = 10, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const topProducts = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      where: {
        sale: {
          organizationId,
          createdAt: { gte: startDate },
        },
      },
      _sum: { quantity: true, total: true },
      _count: true,
      orderBy: { _sum: { total: 'desc' } },
      take: limit,
    });

    const productIds = topProducts.map(p => p.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true, category: true, sellingPrice: true },
    });

    return topProducts.map(p => {
      const product = products.find(pr => pr.id === p.productId);
      return {
        productId: p.productId,
        name: product?.name,
        sku: product?.sku,
        category: product?.category,
        quantitySold: p._sum.quantity,
        revenue: p._sum.total,
        transactions: p._count,
        avgPrice: product?.sellingPrice,
      };
    });
  }

  async getLowStockAlerts(organizationId: string) {
    const products = await this.prisma.product.findMany({
      where: {
        organizationId,
        isActive: true,
        OR: [
          { currentStock: { lte: this.prisma.product.fields.minStockLevel } },
          { currentStock: { lte: this.prisma.product.fields.reorderPoint } },
        ],
      },
      select: {
        id: true,
        name: true,
        sku: true,
        currentStock: true,
        minStockLevel: true,
        reorderPoint: true,
        category: true,
      },
      orderBy: { currentStock: 'asc' },
    });

    return products.map(p => ({
      ...p,
      status: p.currentStock === 0 ? 'OUT_OF_STOCK' : 
              p.currentStock <= p.reorderPoint ? 'CRITICAL' : 'LOW',
      daysUntilStockout: this.estimateDaysUntilStockout(p.id, p.currentStock),
    }));
  }

  private async estimateDaysUntilStockout(productId: string, currentStock: number): Promise<number | null> {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const sales = await this.prisma.saleItem.aggregate({
      where: {
        productId,
        sale: { createdAt: { gte: last30Days } },
      },
      _sum: { quantity: true },
    });

    const totalSold = sales._sum.quantity || 0;
    if (totalSold === 0) return null;

    const avgDailySales = totalSold / 30;
    return Math.floor(currentStock / avgDailySales);
  }

  async getRevenueByCategory(organizationId: string, startDate: Date, endDate: Date) {
    const sales = await this.prisma.saleItem.findMany({
      where: {
        sale: {
          organizationId,
          createdAt: { gte: startDate, lte: endDate },
        },
      },
      include: {
        product: { select: { category: true } },
      },
    });

    const grouped = sales.reduce((acc, item) => {
      const category = item.product.category;
      if (!acc[category]) {
        acc[category] = { category, revenue: 0, quantity: 0, transactions: 0 };
      }
      acc[category].revenue += item.total;
      acc[category].quantity += item.quantity;
      acc[category].transactions += 1;
      return acc;
    }, {} as Record<string, { category: string; revenue: number; quantity: number; transactions: number }>);

    return Object.values(grouped).sort((a, b) => b.revenue - a.revenue);
  }

  async getPaymentMethodBreakdown(organizationId: string, startDate: Date, endDate: Date) {
    const sales = await this.prisma.sale.groupBy({
      by: ['paymentMethod'],
      where: {
        organizationId,
        createdAt: { gte: startDate, lte: endDate },
      },
      _sum: { totalAmount: true },
      _count: true,
    });

    return sales.map(s => ({
      paymentMethod: s.paymentMethod,
      totalAmount: s._sum.totalAmount || 0,
      transactions: s._count,
    }));
  }

  async getCustomerInsights(organizationId: string) {
    const customers = await this.prisma.customer.findMany({
      where: { organizationId, isActive: true },
      include: { _count: { select: { sales: true } }, sales: true },
    });

    return customers.map(c => ({
      id: c.id,
      name: c.name,
      totalPurchases: c._count.sales,
      totalSpent: c.sales.reduce((sum, s) => sum + s.finalAmount, 0),
      loyaltyPoints: c.loyaltyPoints,
      lastPurchase: c.sales[0]?.createdAt,
    })).sort((a, b) => b.totalSpent - a.totalSpent);
  }

  async getBranchComparison(organizationId: string, startDate: Date, endDate: Date) {
    const branches = await this.prisma.branch.findMany({
      where: { organizationId, isActive: true },
    });

    const comparison = await Promise.all(
      branches.map(async (branch) => {
        const sales = await this.prisma.sale.aggregate({
          where: {
            branchId: branch.id,
            createdAt: { gte: startDate, lte: endDate },
          },
          _sum: { finalAmount: true },
          _count: true,
        });

        return {
          branchId: branch.id,
          branchName: branch.name,
          totalSales: sales._sum.finalAmount || 0,
          transactions: sales._count,
        };
      }),
    );

    return comparison.sort((a, b) => b.totalSales - a.totalSales);
  }

  async getEmployeePerformance(organizationId: string, month: Date) {
    const employees = await this.prisma.employee.findMany({
      where: { user: { organizationId }, isActive: true },
      include: {
        user: { select: { fullName: true } },
        targets: { where: { month } },
      },
    });

    return employees.map(e => ({
      employeeId: e.id,
      name: e.user.fullName,
      target: e.targets[0]?.target || 0,
      achieved: e.targets[0]?.achieved || 0,
      commission: e.targets[0]?.commission || 0,
      achievementRate: e.targets[0]?.target ? ((e.targets[0].achieved / e.targets[0].target) * 100).toFixed(2) : 0,
    }));
  }

  async createDailySummary(organizationId: string, date: Date, branchId?: string) {
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const [sales, purchases, expenses] = await Promise.all([
      this.prisma.sale.aggregate({
        where: {
          organizationId,
          ...(branchId && { branchId }),
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
        _sum: { finalAmount: true },
        _count: true,
      }),
      this.prisma.purchase.aggregate({
        where: {
          organizationId,
          ...(branchId && { branchId }),
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
        _sum: { finalAmount: true },
      }),
      this.prisma.expense.aggregate({
        where: {
          organizationId,
          date: { gte: startOfDay, lte: endOfDay },
        },
        _sum: { amount: true },
      }),
    ]);

    const totalSales = sales._sum.finalAmount || 0;
    const totalPurchases = purchases._sum.finalAmount || 0;
    const totalExpenses = expenses._sum.amount || 0;

    return this.prisma.dailySummary.upsert({
      where: {
        organizationId_branchId_date: {
          organizationId,
          branchId: branchId || null,
          date: startOfDay,
        },
      },
      create: {
        organizationId,
        branchId,
        date: startOfDay,
        totalSales,
        totalPurchases,
        totalExpenses,
        profit: totalSales - totalPurchases - totalExpenses,
        transactions: sales._count,
      },
      update: {
        totalSales,
        totalPurchases,
        totalExpenses,
        profit: totalSales - totalPurchases - totalExpenses,
        transactions: sales._count,
      },
    });
  }
}
