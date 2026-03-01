import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  create(data: any, organizationId: string, userId: string) {
    const { expirationDate, ...productData } = data;
    return this.prisma.product.create({
      data: { ...productData, organizationId, createdById: userId },
    });
  }

  findAll(organizationId: string) {
    return this.prisma.product.findMany({ where: { organizationId, isActive: true } });
  }

  findOne(id: string, organizationId: string) {
    return this.prisma.product.findFirst({ where: { id, organizationId } });
  }

  update(id: string, organizationId: string, data: any) {
    return this.prisma.product.update({ where: { id }, data });
  }

  deactivate(id: string) {
    return this.prisma.product.update({ where: { id }, data: { isActive: false } });
  }

  findLowStock(organizationId: string) {
    return this.prisma.$queryRaw`
      SELECT * FROM "Product" 
      WHERE "organizationId" = ${organizationId}::uuid
      AND "isActive" = true 
      AND "currentStock" <= "minStockLevel"
    `;
  }
}
