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

      const sale = await tx.sale.create({
        data: {
          organizationId,
          saleNumber: `SALE-${Date.now()}`,
          totalAmount,
          paymentMethod: data.paymentMethod,
          customerName: data.customerName,
          createdById: userId,
          syncedFromMobile: !!data.mobileRecordId,
          mobileRecordId: data.mobileRecordId,
        } as any,
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

      return sale;
    });
  }

  findAll(organizationId: string) {
    return this.prisma.sale.findMany({
      where: { organizationId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  findOne(id: string, organizationId: string) {
    return this.prisma.sale.findFirst({
      where: { id, organizationId },
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
