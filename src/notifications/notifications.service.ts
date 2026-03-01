import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, type: string, title: string, message: string, data?: any) {
    return this.prisma.notification.create({
      data: { userId, type, title, message, data },
    });
  }

  // Create notification for multiple users
  async createBulk(userIds: string[], type: string, title: string, message: string, data?: any) {
    const notifications = userIds.map(userId => ({
      userId,
      type,
      title,
      message,
      data,
    }));

    return this.prisma.notification.createMany({
      data: notifications,
    });
  }

  // Low stock notifications
  async notifyLowStock(organizationId: string) {
    const lowStockProducts = await this.prisma.product.findMany({
      where: {
        organizationId,
        isActive: true,
        currentStock: { lte: this.prisma.product.fields.minStockLevel },
      },
    });

    if (lowStockProducts.length === 0) return;

    // Notify BOSS and MANAGERS
    const users = await this.prisma.user.findMany({
      where: {
        organizationId,
        role: { in: ['BOSS', 'MANAGER'] },
        isActive: true,
      },
      select: { id: true },
    });

    const userIds = users.map(u => u.id);

    for (const product of lowStockProducts) {
      await this.createBulk(
        userIds,
        'LOW_STOCK',
        'Low Stock Alert',
        `${product.name} is running low. Current: ${product.currentStock}, Min: ${product.minStockLevel}`,
        { productId: product.id, productName: product.name, currentStock: product.currentStock }
      );
    }

    return { notified: userIds.length, products: lowStockProducts.length };
  }

  // Expiry date notifications
  async notifyExpiringProducts(organizationId: string) {
    const daysThreshold = 7; // Notify 7 days before expiry
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysThreshold);

    const expiringProducts = await this.prisma.product.findMany({
      where: {
        organizationId,
        isActive: true,
        hasExpiry: true,
        expirationDate: {
          lte: expiryDate,
          gte: new Date(),
        },
      },
    });

    if (expiringProducts.length === 0) return;

    const users = await this.prisma.user.findMany({
      where: {
        organizationId,
        role: { in: ['BOSS', 'MANAGER'] },
        isActive: true,
      },
      select: { id: true },
    });

    const userIds = users.map(u => u.id);

    for (const product of expiringProducts) {
      const daysLeft = Math.ceil((product.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      await this.createBulk(
        userIds,
        'EXPIRY_WARNING',
        'Product Expiring Soon',
        `${product.name} expires in ${daysLeft} days (${product.expirationDate.toLocaleDateString()})`,
        { productId: product.id, productName: product.name, expirationDate: product.expirationDate }
      );
    }

    return { notified: userIds.length, products: expiringProducts.length };
  }

  // Customer debt notifications
  async notifyHighDebt(organizationId: string) {
    const highDebtCustomers = await this.prisma.customer.findMany({
      where: {
        organizationId,
        isActive: true,
        currentDebt: { gt: 0 },
        creditLimit: { gt: 0 },
      },
    });

    const overdueCustomers = highDebtCustomers.filter(
      c => c.currentDebt >= c.creditLimit * 0.8 // 80% of credit limit
    );

    if (overdueCustomers.length === 0) return;

    const users = await this.prisma.user.findMany({
      where: {
        organizationId,
        role: { in: ['BOSS', 'MANAGER'] },
        isActive: true,
      },
      select: { id: true },
    });

    const userIds = users.map(u => u.id);

    for (const customer of overdueCustomers) {
      await this.createBulk(
        userIds,
        'HIGH_DEBT',
        'Customer Debt Alert',
        `${customer.name} has high debt: ${customer.currentDebt} RWF (${Math.round((customer.currentDebt / customer.creditLimit) * 100)}% of limit)`,
        { customerId: customer.id, customerName: customer.name, debt: customer.currentDebt }
      );
    }

    return { notified: userIds.length, customers: overdueCustomers.length };
  }

  // Task deadline notifications
  async notifyUpcomingDeadlines(organizationId: string) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const upcomingTasks = await this.prisma.task.findMany({
      where: {
        organizationId,
        status: { not: 'COMPLETED' },
        dueDate: {
          lte: tomorrow,
          gte: new Date(),
        },
      },
    });

    if (upcomingTasks.length === 0) return;

    for (const task of upcomingTasks) {
      await this.create(
        task.assignedTo,
        'TASK_DEADLINE',
        'Task Deadline Approaching',
        `Task "${task.title}" is due soon`,
        { taskId: task.id, taskTitle: task.title, dueDate: task.dueDate }
      );
    }

    return { notified: upcomingTasks.length };
  }

  // Sale notification for BOSS/MANAGER
  async notifyNewSale(saleId: string, organizationId: string, amount: number, cashierName: string) {
    const users = await this.prisma.user.findMany({
      where: {
        organizationId,
        role: { in: ['BOSS', 'MANAGER'] },
        isActive: true,
      },
      select: { id: true },
    });

    const userIds = users.map(u => u.id);

    await this.createBulk(
      userIds,
      'NEW_SALE',
      'New Sale',
      `${cashierName} made a sale of ${amount} RWF`,
      { saleId, amount, cashierName }
    );
  }

  findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  findUnread(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  delete(id: string) {
    return this.prisma.notification.delete({ where: { id } });
  }

  async deleteAll(userId: string) {
    return this.prisma.notification.deleteMany({
      where: { userId },
    });
  }
}
