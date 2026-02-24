import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { StockService } from '../stock/stock.service';

@Injectable()
export class SyncService {
  constructor(
    private prisma: PrismaService,
    private stockService: StockService,
  ) {}

  async syncSales(sales: any[], organizationId: string, userId: string) {
    const synced = [];
    const failed = [];

    for (const saleData of sales) {
      try {
        if (saleData.mobileRecordId) {
          const existing = await this.prisma.sale.findFirst({
            where: { organizationId, mobileRecordId: saleData.mobileRecordId },
          });
          if (existing) {
            synced.push(existing);
            continue;
          }
        }

        const sale = await this.prisma.$transaction(async (tx) => {
          const created = await tx.sale.create({
            data: {
              organizationId,
              saleNumber: saleData.saleNumber || `SALE-${Date.now()}`,
              totalAmount: saleData.totalAmount,
              paymentMethod: saleData.paymentMethod,
              customerName: saleData.customerName,
              createdById: userId,
              syncedFromMobile: true,
              mobileRecordId: saleData.mobileRecordId,
              createdAt: new Date(saleData.createdAt),
            } as any,
          });

          // Create items separately
          for (const item of saleData.items) {
            await tx.saleItem.create({
              data: {
                saleId: created.id,
                productId: item.productId,
                quantity: item.quantity,
                sellingPrice: item.sellingPrice,
                costPrice: item.costPrice,
                total: item.total,
              },
            });
          }

          for (const item of saleData.items) {
            await this.stockService.recordTransaction(
              tx,
              organizationId,
              item.productId,
              'SALE',
              item.quantity,
              'Sale',
              created.id,
              userId,
            );
          }

          return created;
        });

        synced.push(sale);
      } catch (error) {
        failed.push({ mobileRecordId: saleData.mobileRecordId, error: error.message });
      }
    }

    return { synced, failed };
  }

  async syncPurchases(purchases: any[], organizationId: string, userId: string) {
    const synced = [];
    const failed = [];

    for (const purchaseData of purchases) {
      try {
        if (purchaseData.mobileRecordId) {
          const existing = await this.prisma.purchase.findFirst({
            where: { organizationId, mobileRecordId: purchaseData.mobileRecordId },
          });
          if (existing) {
            synced.push(existing);
            continue;
          }
        }

        const purchase = await this.prisma.$transaction(async (tx) => {
          const created = await tx.purchase.create({
            data: {
              organizationId,
              purchaseNumber: purchaseData.purchaseNumber || `PUR-${Date.now()}`,
              supplierId: purchaseData.supplierId,
              totalAmount: purchaseData.totalAmount,
              paymentStatus: purchaseData.paymentStatus,
              amountPaid: purchaseData.amountPaid,
              notes: purchaseData.notes,
              createdById: userId,
              syncedFromMobile: true,
              mobileRecordId: purchaseData.mobileRecordId,
              createdAt: new Date(purchaseData.createdAt),
            } as any,
          });

          // Create items separately
          for (const item of purchaseData.items) {
            await tx.purchaseItem.create({
              data: {
                purchaseId: created.id,
                productId: item.productId,
                quantity: item.quantity,
                costPrice: item.costPrice,
                total: item.quantity * item.costPrice,
              },
            });
          }

          for (const item of purchaseData.items) {
            await this.stockService.recordTransaction(
              tx,
              organizationId,
              item.productId,
              'PURCHASE',
              item.quantity,
              'Purchase',
              created.id,
              userId,
            );
          }

          return created;
        });

        synced.push(purchase);
      } catch (error) {
        failed.push({ mobileRecordId: purchaseData.mobileRecordId, error: error.message });
      }
    }

    return { synced, failed };
  }

  getProducts(organizationId: string, lastSyncedAt?: number) {
    const filter: any = { organizationId, isActive: true };
    if (lastSyncedAt) {
      filter.updatedAt = { gt: new Date(lastSyncedAt) };
    }
    return this.prisma.product.findMany({ where: filter });
  }

  getSuppliers(organizationId: string, lastSyncedAt?: number) {
    const filter: any = { organizationId, isActive: true };
    if (lastSyncedAt) {
      filter.updatedAt = { gt: new Date(lastSyncedAt) };
    }
    return this.prisma.supplier.findMany({ where: filter });
  }
}
