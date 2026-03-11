import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
}

export enum AuditResource {
  PRODUCT = 'Product',
  SALE = 'Sale',
  PURCHASE = 'Purchase',
  CUSTOMER = 'Customer',
  SUPPLIER = 'Supplier',
  USER = 'User',
  ORGANIZATION = 'Organization',
  BRANCH = 'Branch',
  STOCK = 'Stock',
  REPORT = 'Report',
  EXPENSE = 'Expense',
  EMPLOYEE = 'Employee',
}

@Injectable()
export class AuditLoggerService {
  private readonly logger = new Logger(AuditLoggerService.name);

  constructor(private prisma: PrismaService) {}

  async log(
    userId: string,
    action: AuditAction,
    resource: AuditResource,
    resourceId?: string,
    details?: any,
    ipAddress?: string,
    organizationId?: string,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          organizationId,
          action,
          resource,
          resourceId,
          details: details ? JSON.parse(JSON.stringify(details)) : null,
          ipAddress,
        },
      });

      this.logger.log(
        `Audit: ${action} ${resource} by user ${userId}${resourceId ? ` (ID: ${resourceId})` : ''}`
      );
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`);
    }
  }

  async logCreate(
    userId: string,
    resource: AuditResource,
    resourceId: string,
    details: any,
    organizationId?: string,
    ipAddress?: string,
  ) {
    return this.log(
      userId,
      AuditAction.CREATE,
      resource,
      resourceId,
      details,
      ipAddress,
      organizationId,
    );
  }

  async logUpdate(
    userId: string,
    resource: AuditResource,
    resourceId: string,
    changes: any,
    organizationId?: string,
    ipAddress?: string,
  ) {
    return this.log(
      userId,
      AuditAction.UPDATE,
      resource,
      resourceId,
      changes,
      ipAddress,
      organizationId,
    );
  }

  async logDelete(
    userId: string,
    resource: AuditResource,
    resourceId: string,
    organizationId?: string,
    ipAddress?: string,
  ) {
    return this.log(
      userId,
      AuditAction.DELETE,
      resource,
      resourceId,
      null,
      ipAddress,
      organizationId,
    );
  }

  async logLogin(userId: string, ipAddress?: string, success: boolean = true) {
    try {
      // Create login history record
      await this.prisma.loginHistory.create({
        data: {
          userId,
          ipAddress: ipAddress || 'unknown',
          success,
        },
      });

      if (success) {
        this.logger.log(`User ${userId} logged in from ${ipAddress || 'unknown'}`);
      } else {
        this.logger.warn(`Failed login attempt for user ${userId} from ${ipAddress || 'unknown'}`);
      }
    } catch (error) {
      this.logger.error(`Failed to log login: ${error.message}`);
    }
  }

  async getAuditLogs(
    organizationId: string,
    filters?: {
      userId?: string;
      action?: AuditAction;
      resource?: AuditResource;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    },
  ) {
    const where: any = { organizationId };

    if (filters?.userId) where.userId = filters.userId;
    if (filters?.action) where.action = filters.action;
    if (filters?.resource) where.resource = filters.resource;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100,
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}
