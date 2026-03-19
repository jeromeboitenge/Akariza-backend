import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { StockService } from '../stock/stock.service';
import { CostManagementService } from '../products/cost-management.service';

@Injectable()
export class PurchasesService {
  constructor(
    private prisma: PrismaService,
    private stockService: StockService,
    private costManagementService: CostManagementService,
  ) {}

  async create(data: any, organizationId: string, userId: string) {
    // Validate required fields
    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('At least one item is required for the purchase.');
    }

    // Validate supplier if provided
    if (data.supplierId) {
      const supplier = await this.prisma.supplier.findFirst({
        where: { 
          id: data.supplierId, 
          organizationId,
          isActive: true 
        },
      });

      if (!supplier) {
        throw new BadRequestException('Selected supplier not found or is inactive.');
      }
    }

    if (data.mobileRecordId) {
      const existing = await this.prisma.purchase.findFirst({
        where: { organizationId, mobileRecordId: data.mobileRecordId },
      });
      if (existing) return { message: 'Purchase already synced', purchase: existing };
    }

    return this.prisma.$transaction(async (tx) => {
      const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.costPrice, 0);
      const finalAmount = totalAmount - (data.discount || 0) + (data.tax || 0);

      const purchase = await tx.purchase.create({
        data: {
          organizationId,
          purchaseNumber: `PUR-${Date.now()}`,
          supplierId: data.supplierId || null, // Handle optional supplier
          totalAmount,
          finalAmount,
          paymentStatus: data.paymentStatus || 'UNPAID',
          amountPaid: data.amountPaid || 0,
          notes: data.notes,
          createdById: userId,
          syncedFromMobile: !!data.mobileRecordId,
          mobileRecordId: data.mobileRecordId,
        },
        include: { items: true },
      });

      // Create items and update stock
      for (const item of data.items) {
        await tx.purchaseItem.create({
          data: {
            purchaseId: purchase.id,
            productId: item.productId,
            quantity: item.quantity,
            costPrice: item.costPrice,
            total: item.quantity * item.costPrice,
          },
        });

        // Record stock transaction
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

        // Update product cost based on new purchase
        const costUpdate = await this.costManagementService.updateProductCostFromPurchase(
          tx,
          organizationId,
          item.productId,
          item.quantity,
          item.costPrice,
          userId,
          purchase.id,
        );

        if (costUpdate.updated) {
          console.log(`💰 Product cost updated: ${costUpdate.oldCost} → ${costUpdate.newCost} RWF (${costUpdate.difference > 0 ? '+' : ''}${costUpdate.difference.toFixed(2)})`);
        }
      }

      return purchase;
    });
  }

  findAll(organizationId?: string) {
    return this.prisma.purchase.findMany({
      where: organizationId ? { organizationId } : {},
      include: { supplier: true, items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string, organizationId?: string) {
    return this.prisma.purchase.findFirst({
      where: organizationId ? { id, organizationId } : { id },
      include: { supplier: true, items: { include: { product: true } } },
    });
  }
}
