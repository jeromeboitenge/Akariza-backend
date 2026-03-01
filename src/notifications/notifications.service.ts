import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

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
      select: { id: true, email: true, fullName: true, role: true },
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

    // Send email to managers
    const managers = users.filter(u => u.role === 'MANAGER');
    for (const manager of managers) {
      const productList = lowStockProducts.map(p => 
        `- ${p.name}: ${p.currentStock} units (Min: ${p.minStockLevel})`
      ).join('\n');

      await this.emailService.sendEmail(
        manager.email,
        'Low Stock Alert - Akariza',
        this.generateLowStockEmail(manager.fullName, productList, lowStockProducts.length)
      ).catch(err => console.error('Email failed:', err));
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
      select: { id: true, email: true, fullName: true, role: true },
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

    // Send email to managers
    const managers = users.filter(u => u.role === 'MANAGER');
    for (const manager of managers) {
      const productList = expiringProducts.map(p => {
        const daysLeft = Math.ceil((p.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return `- ${p.name}: Expires in ${daysLeft} days (${p.expirationDate.toLocaleDateString()})`;
      }).join('\n');

      await this.emailService.sendEmail(
        manager.email,
        'Product Expiry Alert - Akariza',
        this.generateExpiryEmail(manager.fullName, productList, expiringProducts.length)
      ).catch(err => console.error('Email failed:', err));
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

  // Email templates
  private generateLowStockEmail(name: string, productList: string, count: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; background: white; }
          .header { background: #2563eb; padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { padding: 40px 30px; }
          .alert { background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; }
          .products { background: #f8fafc; padding: 20px; margin: 20px 0; font-family: monospace; white-space: pre-line; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; color: #666; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Low Stock Alert</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <div class="alert">
              <strong>${count} product(s) are running low on stock</strong>
            </div>
            <p><strong>Products needing restock:</strong></p>
            <div class="products">${productList}</div>
            <p>Please review and reorder as needed.</p>
          </div>
          <div class="footer">
            <p>Akariza Stock Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateExpiryEmail(name: string, productList: string, count: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; background: white; }
          .header { background: #2563eb; padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { padding: 40px 30px; }
          .alert { background: #fff7ed; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; }
          .products { background: #f8fafc; padding: 20px; margin: 20px 0; font-family: monospace; white-space: pre-line; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; color: #666; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Product Expiry Alert</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <div class="alert">
              <strong>${count} product(s) are expiring soon</strong>
            </div>
            <p><strong>Products expiring within 7 days:</strong></p>
            <div class="products">${productList}</div>
            <p>Please take action to avoid waste.</p>
          </div>
          <div class="footer">
            <p>Akariza Stock Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
