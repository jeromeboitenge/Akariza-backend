import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  create(data: any, organizationId: string) {
    return this.prisma.branch.create({
      data: { ...data, organizationId },
    });
  }

  findAll(organizationId?: string) {
    // If no organizationId (SYSTEM_ADMIN), return all branches
    if (!organizationId) {
      return this.prisma.branch.findMany({
        where: { isActive: true },
        include: { 
          _count: { select: { users: true } },
          organization: { select: { id: true, name: true } }
        },
      });
    }
    
    return this.prisma.branch.findMany({
      where: { organizationId, isActive: true },
      include: { _count: { select: { users: true } } },
    });
  }

  findOne(id: string, organizationId?: string) {
    // If no organizationId (SYSTEM_ADMIN), don't filter by org
    const where: any = { id };
    if (organizationId) {
      where.organizationId = organizationId;
    }
    
    return this.prisma.branch.findFirst({
      where,
      include: { 
        users: true, 
        products: { include: { product: true } },
        organization: { select: { id: true, name: true } }
      },
    });
  }

  update(id: string, data: any) {
    return this.prisma.branch.update({ where: { id }, data });
  }

  deactivate(id: string) {
    return this.prisma.branch.update({ where: { id }, data: { isActive: false } });
  }

  async getInventory(branchId: string) {
    return this.prisma.branchInventory.findMany({
      where: { branchId },
      include: { product: true },
    });
  }

  async createTransfer(data: any, organizationId: string, userId: string) {
    return this.prisma.stockTransfer.create({
      data: {
        organizationId,
        transferNumber: `TRF-${Date.now()}`,
        fromBranchId: data.fromBranchId,
        toBranchId: data.toBranchId,
        status: 'PENDING',
        notes: data.notes,
        createdById: userId,
        items: { create: data.items },
      },
      include: { items: true },
    });
  }

  async approveTransfer(transferId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const transfer = await tx.stockTransfer.findUnique({
        where: { id: transferId },
        include: { items: true },
      });

      for (const item of transfer.items) {
        await tx.branchInventory.update({
          where: { branchId_productId: { branchId: transfer.fromBranchId, productId: item.productId } },
          data: { quantity: { decrement: item.quantity } },
        });

        await tx.branchInventory.upsert({
          where: { branchId_productId: { branchId: transfer.toBranchId, productId: item.productId } },
          create: { branchId: transfer.toBranchId, productId: item.productId, quantity: item.quantity },
          update: { quantity: { increment: item.quantity } },
        });
      }

      return tx.stockTransfer.update({
        where: { id: transferId },
        data: { status: 'COMPLETED', approvedById: userId },
      });
    });
  }
}
