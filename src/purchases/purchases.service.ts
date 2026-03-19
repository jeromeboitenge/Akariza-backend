import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { StockService } from '../stock/stock.service';
import { CostManagementService } from '../products/cost-management.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Injectable()
export class PurchasesService {
  constructor(
    private prisma: PrismaService,
    private stockService: StockService,
    private costManagementService: CostManagementService,
  ) {}

  async create(data: CreatePurchaseDto, organizationId: string, userId: string) {
    console.log('🔍 Purchase creation started:', {
      organizationId,
      userId,
      dataKeys: Object.keys(data),
      itemsCount: data.items?.length || 0
    });

    // Validate required fields
    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('At least one item is required for the purchase.');
    }

    console.log('📦 Items to validate:', data.items);

    // Validate each item
    for (const item of data.items) {
      console.log('🔍 Validating item:', item);
      
      if (!item.productId) {
        throw new BadRequestException('Product ID is required for all items.');
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new BadRequestException('Valid quantity is required for all items.');
      }
      if (!item.costPrice || item.costPrice <= 0) {
        throw new BadRequestException('Valid cost price is required for all items.');
      }

      // Verify product exists
      const product = await this.prisma.product.findFirst({
        where: { id: item.productId, organizationId, isActive: true }
      });
      if (!product) {
        throw new BadRequestException(`Product with ID ${item.productId} not found or inactive.`);
      }
      console.log('✅ Product found:', product.name);
    }

    // Validate supplier if provided
    if (data.supplierId) {
      console.log('🔍 Validating supplier:', data.supplierId);
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
      console.log('✅ Supplier found:', supplier.name);
    }

    if (data.mobileRecordId) {
      const existing = await this.prisma.purchase.findFirst({
        where: { organizationId, mobileRecordId: data.mobileRecordId },
      });
      if (existing) return { message: 'Purchase already synced', purchase: existing };
    }

    console.log('🚀 Starting transaction...');

    return this.prisma.$transaction(async (tx) => {
      try {
        console.log('💰 Calculating totals...');
        // Calculate totals with proper validation
        const totalAmount = data.items.reduce((sum, item) => {
          const quantity = Number(item.quantity);
          const costPrice = Number(item.costPrice);
          if (isNaN(quantity) || isNaN(costPrice)) {
            throw new BadRequestException('Invalid quantity or cost price in items.');
          }
          return sum + (quantity * costPrice);
        }, 0);

        const discount = Number(data.discount) || 0;
        const tax = Number(data.tax) || 0;
        const finalAmount = totalAmount - discount + tax;

        console.log('💰 Totals calculated:', { totalAmount, discount, tax, finalAmount });

        console.log('📝 Creating purchase record...');
        const purchase = await tx.purchase.create({
          data: {
            organizationId,
            purchaseNumber: `PUR-${Date.now()}`,
            supplierId: data.supplierId || null, // Handle optional supplier
            totalAmount,
            discount,
            tax,
            finalAmount,
            paymentStatus: data.paymentStatus || 'UNPAID',
            amountPaid: Number(data.amountPaid) || 0,
            notes: data.notes || null,
            createdById: userId,
            syncedFromMobile: !!data.mobileRecordId,
            mobileRecordId: data.mobileRecordId || null,
          },
          include: { items: true },
        });

        console.log('✅ Purchase created:', purchase.id);

        // Create items and update stock
        for (const item of data.items) {
          const quantity = Number(item.quantity);
          const costPrice = Number(item.costPrice);
          const total = quantity * costPrice;

          await tx.purchaseItem.create({
            data: {
              purchaseId: purchase.id,
              productId: item.productId,
              quantity,
              costPrice,
              total,
            },
          });

          // Record stock transaction
          await this.stockService.recordTransaction(
            tx,
            organizationId,
            item.productId,
            'PURCHASE',
            quantity,
            'Purchase',
            purchase.id,
            userId,
            `Purchase from ${data.supplierId ? 'supplier' : 'unknown supplier'}: ${quantity} units at ${costPrice} RWF each`
          );

          // Update product cost based on new purchase
          try {
            const costUpdate = await this.costManagementService.updateProductCostFromPurchase(
              tx,
              organizationId,
              item.productId,
              quantity,
              costPrice,
              userId,
              purchase.id,
            );

            if (costUpdate.updated) {
              console.log(`💰 Product cost updated: ${costUpdate.oldCost} → ${costUpdate.newCost} RWF (${costUpdate.difference > 0 ? '+' : ''}${costUpdate.difference.toFixed(2)})`);
            }
          } catch (costError) {
            console.warn(`⚠️ Cost update failed for product ${item.productId}:`, costError.message);
            // Continue with purchase creation even if cost update fails
          }
        }

        return purchase;
      } catch (transactionError) {
        console.error('❌ Transaction failed:', transactionError);
        throw transactionError;
      }
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
