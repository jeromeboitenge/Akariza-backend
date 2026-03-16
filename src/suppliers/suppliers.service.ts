import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(createSupplierDto: CreateSupplierDto, organizationId: string, userId: string) {
    try {
      // Check if supplier with same email or phone already exists
      const existingSupplier = await this.prisma.supplier.findFirst({
        where: {
          organizationId,
          OR: [
            { email: createSupplierDto.email },
            { phone: createSupplierDto.phone },
          ],
        },
      });

      if (existingSupplier) {
        throw new BadRequestException('Supplier with this email or phone already exists');
      }

      const supplier = await this.prisma.supplier.create({
        data: {
          name: createSupplierDto.name,
          contactPerson: createSupplierDto.contactPerson,
          phone: createSupplierDto.phone,
          email: createSupplierDto.email || '',
          address: createSupplierDto.address,
          paymentTerms: createSupplierDto.paymentTerms || '',
          rating: createSupplierDto.rating || 5.0,
          creditLimit: createSupplierDto.creditLimit || 0,
          isActive: true,
          organization: {
            connect: { id: organizationId }
          },
          createdBy: {
            connect: { id: userId }
          }
        },
      });

      return supplier;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create supplier');
    }
  }

  async findAll(organizationId: string, includeInactive = false) {
    const suppliers = await this.prisma.supplier.findMany({
      where: {
        organizationId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        _count: {
          select: {
            purchases: true,
            purchaseOrders: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return suppliers;
  }

  async findOne(id: string, organizationId: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, organizationId },
      include: {
        purchases: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            items: {
              include: {
                product: {
                  select: { name: true },
                },
              },
            },
          },
        },
        purchaseOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            purchases: true,
            purchaseOrders: true,
          },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return supplier;
  }

  async update(id: string, organizationId: string, updateSupplierDto: UpdateSupplierDto) {
    const supplier = await this.findOne(id, organizationId);

    // Check for duplicate email/phone if they're being updated
    if (updateSupplierDto.email || updateSupplierDto.phone) {
      const existingSupplier = await this.prisma.supplier.findFirst({
        where: {
          organizationId,
          id: { not: id },
          OR: [
            ...(updateSupplierDto.email ? [{ email: updateSupplierDto.email }] : []),
            ...(updateSupplierDto.phone ? [{ phone: updateSupplierDto.phone }] : []),
          ],
        },
      });

      if (existingSupplier) {
        throw new BadRequestException('Supplier with this email or phone already exists');
      }
    }

    const updatedSupplier = await this.prisma.supplier.update({
      where: { id },
      data: updateSupplierDto,
    });

    return updatedSupplier;
  }

  async remove(id: string, organizationId: string) {
    const supplier = await this.findOne(id, organizationId);

    // Check if supplier has any purchases or purchase orders
    const hasPurchases = await this.prisma.purchase.findFirst({
      where: { supplierId: id },
    });

    const hasPurchaseOrders = await this.prisma.purchaseOrder.findFirst({
      where: { supplierId: id },
    });

    if (hasPurchases || hasPurchaseOrders) {
      // Soft delete - deactivate instead of hard delete
      return this.prisma.supplier.update({
        where: { id },
        data: { isActive: false },
      });
    }

    // Hard delete if no related records
    return this.prisma.supplier.delete({
      where: { id },
    });
  }

  async getSupplierAnalytics(organizationId: string, supplierId?: string) {
    const whereClause = {
      organizationId,
      ...(supplierId && { supplierId }),
    };

    // Get purchase statistics
    const purchaseStats = await this.prisma.purchase.aggregate({
      where: whereClause,
      _sum: {
        finalAmount: true,
        amountPaid: true,
      },
      _count: {
        id: true,
      },
    });

    // Get top suppliers by purchase volume
    const topSuppliers = await this.prisma.purchase.groupBy({
      by: ['supplierId'],
      where: { organizationId },
      _sum: {
        finalAmount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          finalAmount: 'desc',
        },
      },
      take: 10,
    });

    // Get supplier details for top suppliers
    const topSuppliersWithDetails = await Promise.all(
      topSuppliers.map(async (supplier) => {
        const supplierDetails = await this.prisma.supplier.findUnique({
          where: { id: supplier.supplierId },
          select: { name: true, contactPerson: true, rating: true },
        });

        return {
          supplierId: supplier.supplierId,
          supplierName: supplierDetails?.name || 'Unknown',
          contactPerson: supplierDetails?.contactPerson || 'Unknown',
          rating: supplierDetails?.rating || 0,
          totalPurchases: supplier._sum.finalAmount || 0,
          purchaseCount: supplier._count.id,
          averagePurchaseValue: (supplier._sum.finalAmount || 0) / (supplier._count.id || 1),
        };
      })
    );

    // Get payment status breakdown
    const paymentStatusBreakdown = await this.prisma.purchase.groupBy({
      by: ['paymentStatus'],
      where: { organizationId },
      _count: {
        id: true,
      },
      _sum: {
        finalAmount: true,
        amountPaid: true,
      },
    });

    // Get monthly purchase trends (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyTrends = await this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*)::int as purchase_count,
        SUM("finalAmount")::float as total_amount
      FROM "Purchase"
      WHERE "organizationId" = ${organizationId}
        AND "createdAt" >= ${twelveMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    return {
      totalPurchases: purchaseStats._count.id || 0,
      totalPurchaseValue: purchaseStats._sum.finalAmount || 0,
      totalAmountPaid: purchaseStats._sum.amountPaid || 0,
      outstandingAmount: (purchaseStats._sum.finalAmount || 0) - (purchaseStats._sum.amountPaid || 0),
      topSuppliers: topSuppliersWithDetails,
      paymentStatusBreakdown,
      monthlyTrends,
    };
  }

  async updateSupplierRating(id: string, organizationId: string, rating: number) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const supplier = await this.findOne(id, organizationId);

    return this.prisma.supplier.update({
      where: { id },
      data: { rating },
    });
  }

  async updateSupplierBalance(id: string, organizationId: string, amount: number, type: 'increase' | 'decrease') {
    // TODO: Implement when currentBalance field is added to Supplier model
    // const supplier = await this.findOne(id, organizationId);
    // const newBalance = type === 'increase' 
    //   ? supplier.currentBalance + amount
    //   : Math.max(0, supplier.currentBalance - amount);
    // return this.prisma.supplier.update({
    //   where: { id },
    //   data: { currentBalance: newBalance },
    // });
    
    return { message: 'Balance update not implemented yet' };
  }

  async getSupplierPerformance(organizationId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const supplierPerformance = await this.prisma.supplier.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      include: {
        purchases: {
          where: {
            createdAt: { gte: startDate },
          },
          include: {
            items: true,
          },
        },
        purchaseOrders: {
          where: {
            createdAt: { gte: startDate },
          },
        },
      },
    });

    return supplierPerformance.map(supplier => {
      const totalPurchases = supplier.purchases.reduce((sum, purchase) => sum + purchase.finalAmount, 0);
      const purchaseCount = supplier.purchases.length;
      const orderCount = supplier.purchaseOrders.length;
      const averageOrderValue = purchaseCount > 0 ? totalPurchases / purchaseCount : 0;

      // Calculate delivery performance (assuming on-time delivery tracking)
      const onTimeDeliveries = supplier.purchaseOrders.filter(po => po.status === 'DELIVERED').length;
      const deliveryPerformance = orderCount > 0 ? (onTimeDeliveries / orderCount) * 100 : 0;

      return {
        supplierId: supplier.id,
        supplierName: supplier.name,
        contactPerson: supplier.contactPerson,
        rating: supplier.rating,
        totalPurchases,
        purchaseCount,
        orderCount,
        averageOrderValue,
        deliveryPerformance,
        // Note: currentBalance field needs to be added to Supplier model
        // currentBalance: supplier.currentBalance,
        creditLimit: supplier.creditLimit,
        // creditUtilization: supplier.creditLimit > 0 ? (supplier.currentBalance / supplier.creditLimit) * 100 : 0,
        creditUtilization: 0, // Placeholder until currentBalance is implemented
      };
    });
  }
}