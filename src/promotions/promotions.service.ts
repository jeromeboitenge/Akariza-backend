import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  create(data: any, organizationId: string) {
    return this.prisma.promotion.create({
      data: {
        organizationId,
        name: data.name,
        type: data.type,
        discountType: data.discountType,
        discountValue: data.discountValue,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        conditions: data.conditions,
        products: { create: data.productIds?.map(id => ({ productId: id })) || [] },
      },
      include: { products: { include: { product: true } } },
    });
  }

  findAll(organizationId: string) {
    return this.prisma.promotion.findMany({
      where: { organizationId },
      include: { products: { include: { product: true } } },
    });
  }

  findActive(organizationId: string) {
    const now = new Date();
    return this.prisma.promotion.findMany({
      where: {
        organizationId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: { products: { include: { product: true } } },
    });
  }

  findOne(id: string) {
    return this.prisma.promotion.findUnique({
      where: { id },
      include: { products: { include: { product: true } } },
    });
  }

  update(id: string, data: any) {
    return this.prisma.promotion.update({ where: { id }, data });
  }

  deactivate(id: string) {
    return this.prisma.promotion.update({ where: { id }, data: { isActive: false } });
  }

  calculateDiscount(price: number, promotion: any): number {
    if (promotion.discountType === 'PERCENTAGE') {
      return (price * promotion.discountValue) / 100;
    }
    return promotion.discountValue;
  }
}
