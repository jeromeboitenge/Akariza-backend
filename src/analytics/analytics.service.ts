import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(organizationId: string, branchId?: string) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todaySales, monthSales, lowStock, pendingTasks] = await Promise.all([
      this.prisma.sale.aggregate({
        where: {
          organizationId,
          ...(branchId && { branchId }),
          createdAt: { gte: new Date(today.setHours(0, 0, 0, 0)) },
        },
        _sum: { finalAmount: true },
        _count: true,
      }),
      this.prisma.sale.aggregate({
        where: {
          organizationId,
          ...(branchId && { branchId }),
          createdAt: { gte: startOfMonth },
        },
        _sum: { finalAmount: true },
      }),
      this.prisma.product.count({
        where: {
          organizationId,
          isActive: true,
          currentStock: { lte: this.prisma.product.fields.minStockLevel },
        },
      }),
      this.prisma.task.count({
        where: { organizationId, status: 'PENDING' },
      }),
    ]);

    return {
      todaySales: todaySales._sum.finalAmount || 0,
      todayTransactions: todaySales._count,
      monthSales: monthSales._sum.finalAmount || 0,
      lowStockCount: lowStock,
      pendingTasks,
    };
  }

  async getInventoryTurnover(organizationId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sales = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      where: { sale: { organizationId, createdAt: { gte: startDate } } },
      _sum: { quantity: true },
    });

    const products = await this.prisma.product.findMany({
      where: { organizationId, id: { in: sales.map(s => s.productId) } },
      select: { id: true, name: true, currentStock: true },
    });

    return sales.map(s => {
      const product = products.find(p => p.id === s.productId);
      return {
        productId: s.productId,
        productName: product?.name,
        soldQuantity: s._sum.quantity,
        currentStock: product?.currentStock,
        turnoverRate: product?.currentStock ? (s._sum.quantity / product.currentStock).toFixed(2) : 0,
      };
    });
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
