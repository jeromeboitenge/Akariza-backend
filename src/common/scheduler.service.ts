import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // Check for low stock every hour
  @Cron(CronExpression.EVERY_HOUR)
  async checkLowStock() {
    try {
      this.logger.log('Running low stock check...');

      const lowStockProducts = await this.prisma.product.findMany({
        where: {
          isActive: true,
          currentStock: {
            lte: this.prisma.product.fields.minStockLevel,
          },
        },
        include: {
          organization: true,
        },
      });

      this.logger.log(`Found ${lowStockProducts.length} low stock products`);

      for (const product of lowStockProducts) {
        await this.notificationsService.notifyLowStock(
          product.id,
          product.name,
          product.currentStock,
          product.minStockLevel,
        );
      }

      this.logger.log('Low stock check completed');
    } catch (error) {
      this.logger.error(`Low stock check failed: ${error.message}`);
    }
  }

  // Check for expiring products every day at 8 AM
  @Cron('0 8 * * *')
  async checkExpiringProducts() {
    try {
      this.logger.log('Running expiring products check...');

      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const expiringProducts = await this.prisma.product.findMany({
        where: {
          isActive: true,
          hasExpiry: true,
          expiryDate: {
            lte: thirtyDaysFromNow,
            gte: new Date(),
          },
        },
        include: {
          organization: true,
        },
      });

      this.logger.log(`Found ${expiringProducts.length} expiring products`);

      for (const product of expiringProducts) {
        if (product.expiryDate) {
          await this.notificationsService.notifyExpiringProducts(
            product.id,
            product.name,
            product.expiryDate,
          );
        }
      }

      this.logger.log('Expiring products check completed');
    } catch (error) {
      this.logger.error(`Expiring products check failed: ${error.message}`);
    }
  }

  // Generate daily reports at midnight
  @Cron('0 0 * * *')
  async generateDailyReports() {
    try {
      this.logger.log('Generating daily reports...');

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get all organizations
      const organizations = await this.prisma.organization.findMany({
        where: { isActive: true },
      });

      for (const org of organizations) {
        // Get sales for yesterday
        const sales = await this.prisma.sale.findMany({
          where: {
            organizationId: org.id,
            createdAt: {
              gte: yesterday,
              lt: today,
            },
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        const totalSales = sales.reduce((sum, sale) => sum + sale.finalAmount, 0);
        const totalProfit = sales.reduce((sum, sale) => {
          const saleProfit = sale.items.reduce((itemSum, item) => {
            return itemSum + ((item.sellingPrice - item.costPrice) * item.quantity);
          }, 0);
          return sum + saleProfit;
        }, 0);

        this.logger.log(
          `Organization ${org.name}: ${sales.length} sales, Revenue: ${totalSales}, Profit: ${totalProfit}`,
        );

        // Create report record
        await this.prisma.report.create({
          data: {
            organizationId: org.id,
            type: 'DAILY_SALES',
            title: `Daily Sales Report - ${yesterday.toLocaleDateString()}`,
            startDate: yesterday,
            endDate: today,
            data: {
              totalSales: sales.length,
              totalRevenue: totalSales,
              totalProfit: totalProfit,
              date: yesterday.toISOString(),
            },
            generatedBy: 'SYSTEM',
          },
        });
      }

      this.logger.log('Daily reports generated successfully');
    } catch (error) {
      this.logger.error(`Daily report generation failed: ${error.message}`);
    }
  }

  // Clean up old notifications every week
  @Cron(CronExpression.EVERY_WEEK)
  async cleanupOldNotifications() {
    try {
      this.logger.log('Cleaning up old notifications...');

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await this.prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo,
          },
          read: true,
        },
      });

      this.logger.log(`Deleted ${result.count} old notifications`);
    } catch (error) {
      this.logger.error(`Notification cleanup failed: ${error.message}`);
    }
  }

  // Database health check every 5 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async performHealthCheck() {
    try {
      // Simple query to check database connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      this.logger.debug('Database health check: OK');
    } catch (error) {
      this.logger.error(`Database health check failed: ${error.message}`);
    }
  }
}
