import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          data: data.data || {},
          read: false,
        },
      });

      this.logger.log(`Notification created for user ${data.userId}: ${data.title}`);
      return notification;
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error.message}`);
      throw error;
    }
  }

  async createBulkNotifications(notifications: Array<{
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }>) {
    try {
      const result = await this.prisma.notification.createMany({
        data: notifications.map(n => ({
          userId: n.userId,
          type: n.type,
          title: n.title,
          message: n.message,
          data: n.data || {},
          read: false,
        })),
      });

      this.logger.log(`Created ${result.count} notifications`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create bulk notifications: ${error.message}`);
      throw error;
    }
  }

  async notifyLowStock(productId: string, productName: string, currentStock: number, minStock: number) {
    try {
      // Get all managers and bosses in the organization
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        include: { organization: true },
      });

      if (!product) return;

      const users = await this.prisma.user.findMany({
        where: {
          organizationId: product.organizationId,
          role: { in: ['BOSS', 'MANAGER'] },
          isActive: true,
        },
      });

      const notifications = users.map(user => ({
        userId: user.id,
        type: 'LOW_STOCK',
        title: 'Low Stock Alert',
        message: `${productName} is running low. Current stock: ${currentStock}, Minimum: ${minStock}`,
        data: { productId, productName, currentStock, minStock },
      }));

      await this.createBulkNotifications(notifications);
    } catch (error) {
      this.logger.error(`Failed to notify low stock: ${error.message}`);
    }
  }

  async notifyExpiringProducts(productId: string, productName: string, expiryDate: Date) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        include: { organization: true },
      });

      if (!product) return;

      const users = await this.prisma.user.findMany({
        where: {
          organizationId: product.organizationId,
          role: { in: ['BOSS', 'MANAGER'] },
          isActive: true,
        },
      });

      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      const notifications = users.map(user => ({
        userId: user.id,
        type: 'EXPIRING_PRODUCT',
        title: 'Product Expiring Soon',
        message: `${productName} will expire in ${daysUntilExpiry} days`,
        data: { productId, productName, expiryDate, daysUntilExpiry },
      }));

      await this.createBulkNotifications(notifications);
    } catch (error) {
      this.logger.error(`Failed to notify expiring products: ${error.message}`);
    }
  }

  async notifyNewOrder(orderId: string, orderNumber: string, userId: string) {
    try {
      await this.createNotification({
        userId,
        type: 'NEW_ORDER',
        title: 'New Order Received',
        message: `Order ${orderNumber} has been created`,
        data: { orderId, orderNumber },
      });
    } catch (error) {
      this.logger.error(`Failed to notify new order: ${error.message}`);
    }
  }

  async getUserNotifications(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { read: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: { read: true },
    });
  }

  async deleteNotification(notificationId: string, userId: string) {
    return this.prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });
  }
}
