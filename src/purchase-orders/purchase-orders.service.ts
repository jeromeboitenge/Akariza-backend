import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  create(data: any, organizationId: string, userId: string) {
    const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    return this.prisma.purchaseOrder.create({
      data: {
        organizationId,
        poNumber: `PO-${Date.now()}`,
        supplierId: data.supplierId,
        totalAmount,
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
        notes: data.notes,
        createdById: userId,
        items: { create: data.items },
      },
      include: { items: true, supplier: true },
    });
  }

  findAll(organizationId: string) {
    return this.prisma.purchaseOrder.findMany({
      where: { organizationId },
      include: { supplier: true, items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { supplier: true, items: { include: { product: true } } },
    });
  }

  update(id: string, data: any) {
    return this.prisma.purchaseOrder.update({ where: { id }, data });
  }

  async approve(id: string, userId: string) {
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'APPROVED', approvedById: userId },
    });
  }

  async convertToPurchase(poId: string, userId: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: { items: true },
    });

    return this.prisma.purchase.create({
      data: {
        organizationId: po.organizationId,
        purchaseNumber: `PUR-${Date.now()}`,
        supplierId: po.supplierId,
        totalAmount: po.totalAmount,
        finalAmount: po.totalAmount,
        createdById: userId,
        items: {
          create: po.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            costPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
    });
  }
}
