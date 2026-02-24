import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDailySales(organizationId: string, date: Date) {
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const sales = await this.prisma.sale.findMany({
      where: { organizationId, createdAt: { gte: startOfDay, lte: endOfDay } },
      include: { items: true },
    });

    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);

    return { totalSales, totalTransactions: sales.length, sales };
  }

  async getMonthlySales(organizationId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const sales = await this.prisma.sale.findMany({
      where: { organizationId, createdAt: { gte: startDate, lte: endDate } },
    });

    const grouped = sales.reduce((acc, sale) => {
      const day = sale.createdAt.toISOString().split('T')[0];
      if (!acc[day]) acc[day] = { date: day, totalSales: 0, count: 0 };
      acc[day].totalSales += sale.totalAmount;
      acc[day].count++;
      return acc;
    }, {});

    return Object.values(grouped);
  }

  async getProfitReport(organizationId: string, startDate: Date, endDate: Date) {
    const sales = await this.prisma.sale.findMany({
      where: { organizationId, createdAt: { gte: startDate, lte: endDate } },
      include: { items: true },
    });

    let totalRevenue = 0;
    let totalCost = 0;

    sales.forEach(sale => {
      sale.items.forEach(item => {
        totalRevenue += item.total;
        totalCost += item.quantity * item.costPrice;
      });
    });

    return { totalRevenue, totalCost, profit: totalRevenue - totalCost };
  }

  async getBestSelling(organizationId: string, limit: number = 10) {
    const items = await this.prisma.saleItem.findMany({
      where: { sale: { organizationId } },
      include: { product: true },
    });

    const grouped = items.reduce((acc, item) => {
      if (!acc[item.productId]) {
        acc[item.productId] = {
          product: item.product,
          totalQuantity: 0,
          totalRevenue: 0,
        };
      }
      acc[item.productId].totalQuantity += item.quantity;
      acc[item.productId].totalRevenue += item.total;
      return acc;
    }, {});

    return Object.values(grouped)
      .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);
  }

  getLowStock(organizationId: string) {
    return this.prisma.$queryRaw`
      SELECT * FROM "Product" 
      WHERE "organizationId" = ${organizationId} 
      AND "isActive" = true 
      AND "currentStock" <= "minStockLevel"
    `;
  }
}
