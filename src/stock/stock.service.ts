import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async recordTransaction(
    tx: any,
    organizationId: string,
    productId: string,
    type: string,
    quantity: number,
    referenceType: string,
    referenceId: string,
    userId: string,
    notes?: string,
  ) {
    const product = await tx.product.findFirst({ where: { id: productId, organizationId } });
    if (!product) throw new Error('Product not found');

    const quantityChange = type === 'SALE' ? -Math.abs(quantity) : quantity;
    const newBalance = product.currentStock + quantityChange;

    if (newBalance < 0) throw new Error('Insufficient stock');

    await tx.stockTransaction.create({
      data: {
        organizationId,
        productId,
        type,
        quantity: quantityChange,
        referenceType,
        referenceId,
        balanceAfter: newBalance,
        notes,
        createdById: userId,
      },
    });

    await tx.product.update({
      where: { id: productId },
      data: { currentStock: newBalance },
    });

    return { success: true, newBalance };
  }

  async adjustStock(organizationId: string, productId: string, quantity: number, userId: string, notes: string) {
    return this.prisma.$transaction(async (tx) => {
      return this.recordTransaction(
        tx,
        organizationId,
        productId,
        'ADJUSTMENT',
        quantity,
        'Adjustment',
        'manual',
        userId,
        notes,
      );
    });
  }

  getTransactions(organizationId: string, productId?: string) {
    return this.prisma.stockTransaction.findMany({
      where: { organizationId, ...(productId && { productId }) },
      include: { product: { select: { name: true, sku: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getValuation(organizationId: string) {
    const products = await this.prisma.product.findMany({
      where: { organizationId, isActive: true },
      select: { name: true, currentStock: true, costPrice: true },
    });

    const totalValue = products.reduce((sum, p) => sum + p.currentStock * p.costPrice, 0);

    return { totalValue, products: products.map(p => ({ ...p, value: p.currentStock * p.costPrice })) };
  }
}
