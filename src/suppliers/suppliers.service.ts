import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  create(data: any, organizationId: string, userId: string) {
    return this.prisma.supplier.create({
      data: { ...data, organizationId, createdById: userId },
    });
  }

  findAll(organizationId: string) {
    return this.prisma.supplier.findMany({ where: { organizationId, isActive: true } });
  }

  findOne(id: string, organizationId: string) {
    return this.prisma.supplier.findFirst({ where: { id, organizationId } });
  }

  update(id: string, data: any) {
    return this.prisma.supplier.update({ where: { id }, data });
  }

  deactivate(id: string) {
    return this.prisma.supplier.update({ where: { id }, data: { isActive: false } });
  }
}
