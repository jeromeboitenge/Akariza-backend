import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ReportGeneratorService {
  private readonly logger = new Logger(ReportGeneratorService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Generate all reports affected by a sale transaction
   */
  async generateReportsForSale(saleId: string) {
    try {
      const sale = await this.prisma.sale.findUnique({
        where: { id: saleId },
        include: { items: true },
      });

      if (!sale) {
        this.logger.warn(`Sale ${saleId} not found`);
        return;
      }

      this.logger.log(`Generating reports for sale ${saleId}`);

      // Generate all affected reports in parallel
      await Promise.all([
        this.updateDailySalesReport(sale),
        this.updateMonthlySalesReport(sale),
        this.updateProductPerformanceReports(sale),
        this.updateCashierPerformanceReport(sale),
        this.updateInventoryReport(sale),
      ]);

      this.logger.log(`Successfully generated reports for sale ${saleId}`);
    } catch (error) {
      this.logger.error(`Error generating reports for sale ${saleId}:`, error);
      throw error;
    }
  }

  /**
   * Update Daily Sales Report
   */
  private async updateDailySalesReport(sale: any) {
    const date = new Date(sale.createdAt);
    date.setHours(0, 0, 0, 0);

    const totalItemsSold = sale.items.reduce((sum: number, item: any) => sum + item.quantity, 0);

    // Calculate payment method totals
    const paymentTotals = {
      cashSales: sale.paymentMethod === 'CASH' ? sale.finalAmount : 0,
      cardSales: sale.paymentMethod === 'CARD' ? sale.finalAmount : 0,
      mobileSales: sale.paymentMethod === 'MOBILE' ? sale.finalAmount : 0,
    };

    await this.prisma.$executeRaw`
      INSERT INTO "DailySalesReport" (
        id, "organizationId", "branchId", date, 
        "totalSales", "totalTransactions", "totalItemsSold", "averageTransaction",
        "cashSales", "cardSales", "mobileSales", "updatedAt"
      )
      VALUES (
        gen_random_uuid(), ${sale.organizationId}, ${sale.branchId}, ${date},
        ${sale.finalAmount}, 1, ${totalItemsSold}, ${sale.finalAmount},
        ${paymentTotals.cashSales}, ${paymentTotals.cardSales}, ${paymentTotals.mobileSales}, NOW()
      )
      ON CONFLICT ("organizationId", "branchId", date)
      DO UPDATE SET
        "totalSales" = "DailySalesReport"."totalSales" + ${sale.finalAmount},
        "totalTransactions" = "DailySalesReport"."totalTransactions" + 1,
        "totalItemsSold" = "DailySalesReport"."totalItemsSold" + ${totalItemsSold},
        "averageTransaction" = ("DailySalesReport"."totalSales" + ${sale.finalAmount}) / ("DailySalesReport"."totalTransactions" + 1),
        "cashSales" = "DailySalesReport"."cashSales" + ${paymentTotals.cashSales},
        "cardSales" = "DailySalesReport"."cardSales" + ${paymentTotals.cardSales},
        "mobileSales" = "DailySalesReport"."mobileSales" + ${paymentTotals.mobileSales},
        "updatedAt" = NOW()
    `;

    this.logger.log(`Updated daily sales report for ${date.toISOString().split('T')[0]}`);
  }

  /**
   * Update Monthly Sales Report
   */
  private async updateMonthlySalesReport(sale: any) {
    const date = new Date(sale.createdAt);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const totalItemsSold = sale.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const daysInMonth = new Date(year, month, 0).getDate();

    const paymentTotals = {
      cashSales: sale.paymentMethod === 'CASH' ? sale.finalAmount : 0,
      cardSales: sale.paymentMethod === 'CARD' ? sale.finalAmount : 0,
      mobileSales: sale.paymentMethod === 'MOBILE' ? sale.finalAmount : 0,
    };

    await this.prisma.$executeRaw`
      INSERT INTO "MonthlySalesReport" (
        id, "organizationId", "branchId", year, month,
        "totalSales", "totalTransactions", "totalItemsSold", "averagePerDay",
        "cashSales", "cardSales", "mobileSales", "updatedAt"
      )
      VALUES (
        gen_random_uuid(), ${sale.organizationId}, ${sale.branchId}, ${year}, ${month},
        ${sale.finalAmount}, 1, ${totalItemsSold}, ${sale.finalAmount / daysInMonth},
        ${paymentTotals.cashSales}, ${paymentTotals.cardSales}, ${paymentTotals.mobileSales}, NOW()
      )
      ON CONFLICT ("organizationId", "branchId", year, month)
      DO UPDATE SET
        "totalSales" = "MonthlySalesReport"."totalSales" + ${sale.finalAmount},
        "totalTransactions" = "MonthlySalesReport"."totalTransactions" + 1,
        "totalItemsSold" = "MonthlySalesReport"."totalItemsSold" + ${totalItemsSold},
        "averagePerDay" = ("MonthlySalesReport"."totalSales" + ${sale.finalAmount}) / ${daysInMonth},
        "cashSales" = "MonthlySalesReport"."cashSales" + ${paymentTotals.cashSales},
        "cardSales" = "MonthlySalesReport"."cardSales" + ${paymentTotals.cardSales},
        "mobileSales" = "MonthlySalesReport"."mobileSales" + ${paymentTotals.mobileSales},
        "updatedAt" = NOW()
    `;

    this.logger.log(`Updated monthly sales report for ${year}-${month}`);
  }

  /**
   * Update Product Performance Reports
   */
  private async updateProductPerformanceReports(sale: any) {
    const date = new Date(sale.createdAt);
    date.setHours(0, 0, 0, 0);

    for (const item of sale.items) {
      const profit = item.total - (item.quantity * item.costPrice);

      await this.prisma.$executeRaw`
        INSERT INTO "ProductPerformanceReport" (
          id, "organizationId", "productId", period, "periodDate",
          "totalQuantitySold", "totalRevenue", "totalCost", "totalProfit", "transactionCount", "updatedAt"
        )
        VALUES (
          gen_random_uuid(), ${sale.organizationId}, ${item.productId}, 'daily', ${date},
          ${item.quantity}, ${item.total}, ${item.quantity * item.costPrice}, ${profit}, 1, NOW()
        )
        ON CONFLICT ("productId", period, "periodDate")
        DO UPDATE SET
          "totalQuantitySold" = "ProductPerformanceReport"."totalQuantitySold" + ${item.quantity},
          "totalRevenue" = "ProductPerformanceReport"."totalRevenue" + ${item.total},
          "totalCost" = "ProductPerformanceReport"."totalCost" + ${item.quantity * item.costPrice},
          "totalProfit" = "ProductPerformanceReport"."totalProfit" + ${profit},
          "transactionCount" = "ProductPerformanceReport"."transactionCount" + 1,
          "updatedAt" = NOW()
      `;
    }

    this.logger.log(`Updated product performance reports for ${sale.items.length} products`);
  }

  /**
   * Update Cashier Performance Report
   */
  private async updateCashierPerformanceReport(sale: any) {
    const date = new Date(sale.createdAt);
    date.setHours(0, 0, 0, 0);

    const totalItemsSold = sale.items.reduce((sum: number, item: any) => sum + item.quantity, 0);

    await this.prisma.$executeRaw`
      INSERT INTO "CashierPerformanceReport" (
        id, "organizationId", "userId", date,
        "totalSales", "totalTransactions", "totalItemsSold", "averageTransaction", "updatedAt"
      )
      VALUES (
        gen_random_uuid(), ${sale.organizationId}, ${sale.createdById}, ${date},
        ${sale.finalAmount}, 1, ${totalItemsSold}, ${sale.finalAmount}, NOW()
      )
      ON CONFLICT ("userId", date)
      DO UPDATE SET
        "totalSales" = "CashierPerformanceReport"."totalSales" + ${sale.finalAmount},
        "totalTransactions" = "CashierPerformanceReport"."totalTransactions" + 1,
        "totalItemsSold" = "CashierPerformanceReport"."totalItemsSold" + ${totalItemsSold},
        "averageTransaction" = ("CashierPerformanceReport"."totalSales" + ${sale.finalAmount}) / ("CashierPerformanceReport"."totalTransactions" + 1),
        "updatedAt" = NOW()
    `;

    this.logger.log(`Updated cashier performance report for user ${sale.createdById}`);
  }

  /**
   * Update Inventory Report
   */
  private async updateInventoryReport(sale: any) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    // Calculate inventory metrics
    const inventoryMetrics = await this.prisma.$queryRaw<any[]>`
      SELECT 
        COUNT(*) as "totalProducts",
        SUM("currentStock" * "costPrice") as "totalStockValue",
        COUNT(CASE WHEN "currentStock" <= "minStockLevel" THEN 1 END) as "lowStockCount",
        COUNT(CASE WHEN "currentStock" = 0 THEN 1 END) as "outOfStockCount",
        COUNT(CASE WHEN "expirationDate" IS NOT NULL AND "expirationDate" <= NOW() + INTERVAL '30 days' THEN 1 END) as "expiringCount"
      FROM "Product"
      WHERE "organizationId" = ${sale.organizationId}
        AND "isActive" = true
    `;

    const metrics = inventoryMetrics[0];

    await this.prisma.$executeRaw`
      INSERT INTO "InventoryReport" (
        id, "organizationId", "branchId", date,
        "totalProducts", "totalStockValue", "lowStockCount", "outOfStockCount", "expiringCount", "updatedAt"
      )
      VALUES (
        gen_random_uuid(), ${sale.organizationId}, ${sale.branchId}, ${date},
        ${metrics.totalProducts}, ${metrics.totalStockValue || 0}, ${metrics.lowStockCount}, 
        ${metrics.outOfStockCount}, ${metrics.expiringCount}, NOW()
      )
      ON CONFLICT ("organizationId", "branchId", date)
      DO UPDATE SET
        "totalProducts" = ${metrics.totalProducts},
        "totalStockValue" = ${metrics.totalStockValue || 0},
        "lowStockCount" = ${metrics.lowStockCount},
        "outOfStockCount" = ${metrics.outOfStockCount},
        "expiringCount" = ${metrics.expiringCount},
        "updatedAt" = NOW()
    `;

    this.logger.log(`Updated inventory report for ${date.toISOString().split('T')[0]}`);
  }

  /**
   * Generate reports for a specific date (for backfilling or corrections)
   */
  async regenerateReportsForDate(organizationId: string, date: Date) {
    this.logger.log(`Regenerating reports for ${date.toISOString().split('T')[0]}`);

    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const sales = await this.prisma.sale.findMany({
      where: {
        organizationId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      include: { items: true },
    });

    for (const sale of sales) {
      await this.generateReportsForSale(sale.id);
    }

    this.logger.log(`Regenerated reports for ${sales.length} sales`);
  }
}
