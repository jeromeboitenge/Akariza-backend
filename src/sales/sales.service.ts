import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { StockService } from '../stock/stock.service';

@Injectable()
export class SalesService {
  constructor(
    private prisma: PrismaService,
    private stockService: StockService,
  ) {}

  async create(data: any, organizationId: string, userId: string) {
    // Validate: Customer is required for credit/unpaid sales
    const paymentStatus = data.paymentStatus || 'PAID';
    if (paymentStatus === 'UNPAID' || paymentStatus === 'PARTIAL') {
      if (!data.customerId) {
        throw new Error('Customer is required for credit/loan sales');
      }
      
      // Verify customer exists and belongs to organization
      const customer = await this.prisma.customer.findFirst({
        where: { id: data.customerId, organizationId, isActive: true },
      });
      if (!customer) {
        throw new Error('Customer not found or inactive');
      }
      
      // Check credit limit
      const newDebt = customer.currentDebt + (data.finalAmount - (data.amountPaid || 0));
      if (customer.creditLimit > 0 && newDebt > customer.creditLimit) {
        throw new Error(`Credit limit exceeded. Limit: ${customer.creditLimit}, Current debt: ${customer.currentDebt}`);
      }
    }

    if (data.mobileRecordId) {
      const existing = await this.prisma.sale.findFirst({
        where: { organizationId, mobileRecordId: data.mobileRecordId },
      });
      if (existing) return { message: 'Sale already synced', sale: existing };
    }

    return this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const enrichedItems = [];

      for (const item of data.items) {
        const product = await tx.product.findFirst({
          where: { id: item.productId, organizationId },
        });
        if (!product) throw new Error(`Product ${item.productId} not found`);
        if (product.currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        const itemTotal = item.quantity * item.sellingPrice;
        totalAmount += itemTotal;

        enrichedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          sellingPrice: item.sellingPrice,
          costPrice: product.costPrice,
          total: itemTotal,
        });
      }

      const discount = data.discount || 0;
      const tax = data.tax || 0;
      const finalAmount = totalAmount - discount + tax;
      
      // Calculate amount paid and change
      const amountPaid = data.amountPaid || finalAmount;
      const change = amountPaid > finalAmount ? amountPaid - finalAmount : 0;
      
      // Determine payment status
      let calculatedPaymentStatus = paymentStatus;
      if (amountPaid >= finalAmount) {
        calculatedPaymentStatus = 'PAID';
      } else if (amountPaid > 0 && amountPaid < finalAmount) {
        calculatedPaymentStatus = 'PARTIAL';
      } else {
        calculatedPaymentStatus = 'UNPAID';
      }

      const sale = await tx.sale.create({
        data: {
          organizationId,
          branchId: data.branchId,
          customerId: data.customerId || null,
          saleNumber: `SALE-${Date.now()}`,
          totalAmount,
          discount,
          tax,
          finalAmount,
          amountPaid,
          change,
          paymentMethod: data.paymentMethod,
          paymentStatus: calculatedPaymentStatus,
          customerName: data.customerName || 'Walk-in Customer',
          createdById: userId,
          syncedFromMobile: !!data.mobileRecordId,
          mobileRecordId: data.mobileRecordId,
        },
        include: { items: true },
      });

      // Create items separately
      for (const item of enrichedItems) {
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            sellingPrice: item.sellingPrice,
            costPrice: item.costPrice,
            total: item.total,
          },
        });
      }

      for (const item of enrichedItems) {
        await this.stockService.recordTransaction(
          tx,
          organizationId,
          item.productId,
          'SALE',
          item.quantity,
          'Sale',
          sale.id,
          userId,
        );
      }

      // Update customer debt if credit sale
      if (data.customerId && calculatedPaymentStatus !== 'PAID') {
        const debtAmount = finalAmount - amountPaid;
        await tx.customer.update({
          where: { id: data.customerId },
          data: { currentDebt: { increment: debtAmount } },
        });
      }

      return sale;
    });
  }

  findAll(organizationId?: string) {
    return this.prisma.sale.findMany({
      where: organizationId ? { organizationId } : {},
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  findOne(id: string, organizationId?: string) {
    return this.prisma.sale.findFirst({
      where: organizationId ? { id, organizationId } : { id },
      include: { items: { include: { product: true } } },
    });
  }

  findMySales(organizationId: string, userId: string) {
    return this.prisma.sale.findMany({
      where: { organizationId, createdById: userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
