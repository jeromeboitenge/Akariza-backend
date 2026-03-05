import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  // CASHIER Dashboard
  async getCashierDashboard(userId: string, organizationId: string, branchId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      todaySales,
      todaySalesCount,
      todayRevenue,
      recentSales,
      lowStockProducts,
      pendingTasks,
      unreadMessages,
    ] = await Promise.all([
      // Today's sales by this cashier
      this.prisma.sale.findMany({
        where: {
          createdById: userId,
          createdAt: { gte: today },
        },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      // Count of sales today
      this.prisma.sale.count({
        where: {
          createdById: userId,
          createdAt: { gte: today },
        },
      }),
      // Total revenue today
      this.prisma.sale.aggregate({
        where: {
          createdById: userId,
          createdAt: { gte: today },
        },
        _sum: { finalAmount: true },
      }),
      // Recent sales (last 5)
      this.prisma.sale.findMany({
        where: { createdById: userId },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // Low stock products
      this.prisma.product.findMany({
        where: {
          organizationId,
          isActive: true,
          currentStock: { lte: this.prisma.product.fields.minStockLevel },
        },
        take: 10,
      }),
      // Pending tasks assigned to cashier
      this.prisma.task.findMany({
        where: {
          assignedTo: userId,
          status: { not: 'COMPLETED' },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),
      // Unread messages
      this.prisma.message.count({
        where: {
          receiverId: userId,
          isRead: false,
        },
      }),
    ]);

    return {
      summary: {
        todaySalesCount,
        todayRevenue: todayRevenue._sum.finalAmount || 0,
        lowStockCount: lowStockProducts.length,
        pendingTasksCount: pendingTasks.length,
        unreadMessagesCount: unreadMessages,
      },
      todaySales,
      recentSales,
      lowStockProducts,
      pendingTasks,
    };
  }

  // MANAGER Dashboard
  async getManagerDashboard(userId: string, organizationId: string, branchId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      todayBranchSales,
      monthBranchSales,
      branchInventoryValue,
      topSellingProducts,
      branchStaff,
      lowStockProducts,
      pendingPurchaseOrders,
      recentExpenses,
      totalProducts,
      totalCustomers,
    ] = await Promise.all([
      // Today's branch sales
      this.prisma.sale.aggregate({
        where: {
          branchId,
          createdAt: { gte: today },
        },
        _sum: { finalAmount: true },
        _count: true,
      }),
      // This month's branch sales
      this.prisma.sale.aggregate({
        where: {
          branchId,
          createdAt: { gte: monthStart },
        },
        _sum: { finalAmount: true },
        _count: true,
      }),
      // Branch inventory value
      this.prisma.product.aggregate({
        where: { organizationId, isActive: true },
        _sum: {
          currentStock: true,
        },
      }),
      // Top selling products in branch
      this.prisma.saleItem.groupBy({
        by: ['productId'],
        where: {
          sale: {
            branchId,
            createdAt: { gte: monthStart },
          },
        },
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { total: 'desc' } },
        take: 10,
      }),
      // Branch staff
      this.prisma.user.findMany({
        where: { branchId, isActive: true },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      }),
      // Low stock
      this.prisma.product.findMany({
        where: {
          organizationId,
          isActive: true,
          currentStock: { lte: this.prisma.product.fields.minStockLevel },
        },
        take: 20,
      }),
      // Pending purchase orders
      this.prisma.purchaseOrder.findMany({
        where: {
          organizationId,
          status: 'PENDING',
        },
        include: { supplier: true },
        take: 10,
      }),
      // Recent expenses
      this.prisma.expense.findMany({
        where: { organizationId },
        orderBy: { date: 'desc' },
        take: 10,
      }),
      // Total products
      this.prisma.product.count({
        where: { organizationId, isActive: true },
      }),
      // Total customers
      this.prisma.customer.count({
        where: { organizationId, isActive: true },
      }),
    ]);

    return {
      summary: {
        todaySales: todayBranchSales._sum.finalAmount || 0,
        todaySalesCount: todayBranchSales._count,
        monthSales: monthBranchSales._sum.finalAmount || 0,
        monthSalesCount: monthBranchSales._count,
        inventoryValue: branchInventoryValue._sum.currentStock || 0,
        staffCount: branchStaff.length,
        lowStockCount: lowStockProducts.length,
        pendingPOCount: pendingPurchaseOrders.length,
        totalProducts,
        totalCustomers,
      },
      topSellingProducts,
      branchStaff,
      lowStockProducts,
      pendingPurchaseOrders,
      recentExpenses,
    };
  }

  // BOSS Dashboard
  async getBossDashboard(organizationId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    const [
      todayOrgSales,
      monthOrgSales,
      lastMonthSales,
      totalInventoryValue,
      totalCustomers,
      totalProducts,
      branches,
      topSellingProducts,
      salesByBranch,
      recentSales,
      lowStockProducts,
      totalUsers,
      pendingTasks,
    ] = await Promise.all([
      // Today's organization sales
      this.prisma.sale.aggregate({
        where: {
          organizationId,
          createdAt: { gte: today },
        },
        _sum: { finalAmount: true },
        _count: true,
      }),
      // This month's sales
      this.prisma.sale.aggregate({
        where: {
          organizationId,
          createdAt: { gte: monthStart },
        },
        _sum: { finalAmount: true },
        _count: true,
      }),
      // Last month's sales
      this.prisma.sale.aggregate({
        where: {
          organizationId,
          createdAt: { gte: lastMonth, lt: monthStart },
        },
        _sum: { finalAmount: true },
      }),
      // Total inventory value
      this.prisma.product.aggregate({
        where: { organizationId, isActive: true },
        _sum: {
          currentStock: true,
        },
      }),
      // Total customers
      this.prisma.customer.count({
        where: { organizationId, isActive: true },
      }),
      // Total products
      this.prisma.product.count({
        where: { organizationId, isActive: true },
      }),
      // All branches
      this.prisma.branch.findMany({
        where: { organizationId, isActive: true },
        include: {
          _count: { select: { users: true, sales: true } },
        },
      }),
      // Top selling products
      this.prisma.saleItem.groupBy({
        by: ['productId'],
        where: {
          sale: {
            organizationId,
            createdAt: { gte: monthStart },
          },
        },
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { total: 'desc' } },
        take: 10,
      }),
      // Sales by branch
      this.prisma.sale.groupBy({
        by: ['branchId'],
        where: {
          organizationId,
          createdAt: { gte: monthStart },
        },
        _sum: { finalAmount: true },
        _count: true,
      }),
      // Recent sales
      this.prisma.sale.findMany({
        where: { organizationId },
        include: {
          createdBy: { select: { fullName: true } },
          branch: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      // Low stock
      this.prisma.product.findMany({
        where: {
          organizationId,
          isActive: true,
          currentStock: { lte: this.prisma.product.fields.minStockLevel },
        },
        take: 20,
      }),
      // Total users
      this.prisma.user.count({
        where: { organizationId, isActive: true },
      }),
      // Pending tasks
      this.prisma.task.count({
        where: {
          organizationId,
          status: { not: 'COMPLETED' },
        },
      }),
    ]);

    // Calculate profit from sale items
    const monthSaleItems = await this.prisma.saleItem.aggregate({
      where: {
        sale: {
          organizationId,
          createdAt: { gte: monthStart },
        },
      },
      _sum: { total: true, costPrice: true },
    });

    const profit = (monthSaleItems._sum.total || 0) - (monthSaleItems._sum.costPrice || 0);
    const growthRate = lastMonthSales._sum.finalAmount
      ? ((monthOrgSales._sum.finalAmount - lastMonthSales._sum.finalAmount) / lastMonthSales._sum.finalAmount) * 100
      : 0;

    return {
      summary: {
        todaySales: todayOrgSales._sum.finalAmount || 0,
        todaySalesCount: todayOrgSales._count,
        monthSales: monthOrgSales._sum.finalAmount || 0,
        monthSalesCount: monthOrgSales._count,
        monthProfit: profit,
        growthRate: Math.round(growthRate * 100) / 100,
        inventoryValue: totalInventoryValue._sum.currentStock || 0,
        totalCustomers,
        totalProducts,
        totalBranches: branches.length,
        totalUsers,
        lowStockCount: lowStockProducts.length,
        pendingTasksCount: pendingTasks,
      },
      branches,
      topSellingProducts,
      salesByBranch,
      recentSales,
      lowStockProducts,
    };
  }
}
