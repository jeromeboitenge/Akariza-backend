import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { StockService } from '../stock/stock.service';

@Injectable()
export class PurchasesService {
  constructor(
    private prisma: PrismaService,
    private stockService: StockService,
  ) {}

  async create(data: any, organizationId: string, userId: string) {
    if (data.mobileRecordId) {
      const existing = await this.prisma.purchase.findFirst({
        where: { organizationId, mobileRecordId: data.mobileRecordId },
      });
      if (existing) return { message: 'Purchase already synced', purchase: existing };
    }

    return this.prisma.$transaction(async (tx) => {
      const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.costPrice, 0);

      const purchase = await tx.purchase.create({
        data: {
          organizationId,
          purchaseNumber: `PUR-${Date.now()}`,
          supplierId: data.supplierId,
          totalAmount,
          paymentStatus: data.paymentStatus,
          amountPaid: data.amountPaid || 0,
          notes: data.notes,
          createdById: userId,
          syncedFromMobile: !!data.mobileRecordId,
          mobileRecordId: data.mobileRecordId,
          items: { create: data.items },
        },
        include: { items: true },
      });

      for (const item of data.items) {
        await this.stockService.recordTransaction(
          tx,
          organizationId,
          item.productId,
          'PURCHASE',
          item.quantity,
          'Purchase',
          purchase.id,
          userId,
        );
      }

      return purchase;
    });
  }

  findAll(organizationId: string) {
    return this.prisma.purchase.findMany({
      where: { organizationId },
      include: { supplier: true, items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string, organizationId: string) {
    return this.prisma.purchase.findFirst({
      where: { id, organizationId },
      include: { supplier: true, items: { include: { product: true } } },
    });
  }
}
