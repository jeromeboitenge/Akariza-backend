import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdvancedAnalyticsService {
  private readonly logger = new Logger(AdvancedAnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  async getProductPerformance(organizationId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const productSales = await this.prisma.saleItem.groupBy({
        by: ['productId'],
        where: {
          sale: {
            organizationId,
            createdAt: { gte: startDate },
          },
        },
        _sum: {
          quantity: true,
          total: true,
        },
        _count: {
          id: true,
        },
      });

      const productsWithDetails = await Promise.all(
        productSales.map(async (item) => {
          const product = await this.prisma.product.findUnique({
            where: { id: item.productId },
            select: { name: true, category: true, sellingPrice: true, costPrice: true },
          });

          const profit = (product?.sellingPrice - product?.costPrice) * (item._sum.quantity || 0);

          return {
            productId: item.productId,
            productName: product?.name || 'Unknown',
            category: product?.category || 'Unknown',
            quantitySold: item._sum.quantity || 0,
            totalRevenue: item._sum.total || 0,
            totalProfit: profit,
            transactionCount: item._count.id,
            averageOrderValue: (item._sum.total || 0) / (item._count.id || 1),
          };
        })
      );

      return productsWithDetails.sort((a, b) => b.totalRevenue - a.totalRevenue);
    } catch (error) {
      this.logger.error(`Failed to get product performance: ${error.message}`);
      throw error;
    }
  }

  async getSalesTrends(organizationId: string, period: 'daily' | 'weekly' | 'monthly' = 'daily', days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const sales = await this.prisma.sale.findMany({
        where: {
          organizationId,
          createdAt: { gte: startDate },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      const trends = this.groupSalesByPeriod(sales, period);
      return trends;
    } catch (error) {
      this.logger.error(`Failed to get sales trends: ${error.message}`);
      throw error;
    }
  }

  private groupSalesByPeriod(sales: any[], period: 'daily' | 'weekly' | 'monthly') {
    const grouped = new Map();

    sales.forEach(sale => {
      let key: string;
      const date = new Date(sale.createdAt);

      switch (period) {
        case 'daily':
          key = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!grouped.has(key)) {
        grouped.set(key, {
          period: key,
          totalSales: 0,
          totalRevenue: 0,
          totalProfit: 0,
          transactionCount: 0,
        });
      }

      const group = grouped.get(key);
      group.totalSales += 1;
      group.totalRevenue += sale.finalAmount;
      group.transactionCount += 1;

      // Calculate profit
      const saleProfit = sale.items.reduce((sum: number, item: any) => {
        return sum + ((item.sellingPrice - item.costPrice) * item.quantity);
      }, 0);
      group.totalProfit += saleProfit;
    });

    return Array.from(grouped.values()).sort((a, b) => a.period.localeCompare(b.period));
  }

  async getCustomerAnalytics(organizationId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const customerSales = await this.prisma.sale.groupBy({
        by: ['customerId'],
        where: {
          organizationId,
          createdAt: { gte: startDate },
          customerId: { not: null },
        },
        _sum: {
          finalAmount: true,
        },
        _count: {
          id: true,
        },
      });

      const customersWithDetails = await Promise.all(
        customerSales.map(async (item) => {
          const customer = await this.prisma.customer.findUnique({
            where: { id: item.customerId! },
            select: { name: true, email: true, phone: true, customerType: true },
          });

          return {
            customerId: item.customerId,
            customerName: customer?.name || 'Unknown',
            customerType: customer?.customerType || 'REGULAR',
            totalSpent: item._sum.finalAmount || 0,
            transactionCount: item._count.id,
            averageOrderValue: (item._sum.finalAmount || 0) / (item._count.id || 1),
          };
        })
      );

      return customersWithDetails.sort((a, b) => b.totalSpent - a.totalSpent);
    } catch (error) {
      this.logger.error(`Failed to get customer analytics: ${error.message}`);
      throw error;
    }
  }

  async getInventoryAnalytics(organizationId: string) {
    try {
      const products = await this.prisma.product.findMany({
        where: { organizationId, isActive: true },
        select: {
          id: true,
          name: true,
          category: true,
          currentStock: true,
          minStockLevel: true,
          maxStockLevel: true,
          costPrice: true,
          sellingPrice: true,
        },
      });

      const totalProducts = products.length;
      const totalValue = products.reduce((sum, p) => sum + (p.currentStock * p.costPrice), 0);
      const lowStockCount = products.filter(p => p.currentStock <= p.minStockLevel).length;
      const outOfStockCount = products.filter(p => p.currentStock === 0).length;
      const overstockedCount = products.filter(p => p.currentStock >= p.maxStockLevel).length;

      const categoryBreakdown = products.reduce((acc, product) => {
        const category = product.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = {
            count: 0,
            totalValue: 0,
            totalStock: 0,
          };
        }
        acc[category].count += 1;
        acc[category].totalValue += product.currentStock * product.costPrice;
        acc[category].totalStock += product.currentStock;
        return acc;
      }, {} as Record<string, any>);

      return {
        totalProducts,
        totalValue,
        lowStockCount,
        outOfStockCount,
        overstockedCount,
        categoryBreakdown,
        stockStatus: {
          healthy: totalProducts - lowStockCount - outOfStockCount - overstockedCount,
          lowStock: lowStockCount,
          outOfStock: outOfStockCount,
          overstocked: overstockedCount,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get inventory analytics: ${error.message}`);
      throw error;
    }
  }

  async getCashierPerformance(organizationId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const cashierSales = await this.prisma.sale.groupBy({
        by: ['createdBy'],
        where: {
          organizationId,
          createdAt: { gte: startDate },
          createdBy: { not: null },
        },
        _sum: {
          finalAmount: true,
        },
        _count: {
          id: true,
        },
      });

      const cashiersWithDetails = await Promise.all(
        cashierSales.map(async (item) => {
          const user = await this.prisma.user.findUnique({
            where: { id: item.createdBy! },
            select: { name: true, email: true, role: true },
          });

          return {
            userId: item.createdBy,
            userName: user?.name || 'Unknown',
            userRole: user?.role || 'UNKNOWN',
            totalSales: item._sum.finalAmount || 0,
            transactionCount: item._count.id,
            averageTransactionValue: (item._sum.finalAmount || 0) / (item._count.id || 1),
          };
        })
      );

      return cashiersWithDetails.sort((a, b) => b.totalSales - a.totalSales);
    } catch (error) {
      this.logger.error(`Failed to get cashier performance: ${error.message}`);
      throw error;
    }
  }

  async getProfitAnalysis(organizationId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const sales = await this.prisma.sale.findMany({
        where: {
          organizationId,
          createdAt: { gte: startDate },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      let totalRevenue = 0;
      let totalCost = 0;
      let totalProfit = 0;

      const profitByCategory = new Map();
      const profitByProduct = new Map();

      sales.forEach(sale => {
        totalRevenue += sale.finalAmount;

        sale.items.forEach(item => {
          const itemCost = item.costPrice * item.quantity;
          const itemRevenue = item.sellingPrice * item.quantity;
          const itemProfit = itemRevenue - itemCost;

          totalCost += itemCost;
          totalProfit += itemProfit;

          // Category profit
          const category = item.product?.category || 'Uncategorized';
          if (!profitByCategory.has(category)) {
            profitByCategory.set(category, { revenue: 0, cost: 0, profit: 0 });
          }
          const categoryData = profitByCategory.get(category);
          categoryData.revenue += itemRevenue;
          categoryData.cost += itemCost;
          categoryData.profit += itemProfit;

          // Product profit
          const productId = item.productId;
          if (!profitByProduct.has(productId)) {
            profitByProduct.set(productId, {
              productName: item.product?.name || 'Unknown',
              revenue: 0,
              cost: 0,
              profit: 0,
              quantity: 0,
            });
          }
          const productData = profitByProduct.get(productId);
          productData.revenue += itemRevenue;
          productData.cost += itemCost;
          productData.profit += itemProfit;
          productData.quantity += item.quantity;
        });
      });

      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      return {
        totalRevenue,
        totalCost,
        totalProfit,
        profitMargin,
        profitByCategory: Array.from(profitByCategory.entries()).map(([category, data]) => ({
          category,
          ...data,
          margin: data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0,
        })),
        profitByProduct: Array.from(profitByProduct.values())
          .sort((a, b) => b.profit - a.profit)
          .slice(0, 10), // Top 10 most profitable products
      };
    } catch (error) {
      this.logger.error(`Failed to get profit analysis: ${error.message}`);
      throw error;
    }
  }
}