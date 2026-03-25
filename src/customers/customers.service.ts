// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, organizationId: string) {
    // Check if phone already exists in organization
    const existing = await this.prisma.customer.findFirst({
      where: { organizationId, phone: data.phone }
    });
    if (existing) {
      throw new Error('Customer with this phone number already exists');
    }

    return this.prisma.customer.create({
      data: { ...data, organizationId },
    });
  }

  findAll(organizationId?: string) {
    return this.prisma.customer.findMany({
      where: organizationId ? { organizationId, isActive: true } : { isActive: true },
      include: { _count: { select: { sales: true } } },
    });
  }

  findOne(id: string, organizationId?: string) {
    return this.prisma.customer.findFirst({
      where: organizationId ? { id, organizationId } : { id },
      include: { sales: true, transactions: true, loyaltyHistory: true },
    });
  }

  update(id: string, data: any) {
    return this.prisma.customer.update({ where: { id }, data });
  }

  deactivate(id: string) {
    return this.prisma.customer.update({ where: { id }, data: { isActive: false } });
  }

  async addLoyaltyPoints(customerId: string, points: number, reference: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.loyaltyTransaction.create({
        data: { customerId, points, type: 'EARNED', reference },
      });
      return tx.customer.update({
        where: { id: customerId },
        data: { loyaltyPoints: { increment: points } },
      });
    });
  }

  async redeemLoyaltyPoints(customerId: string, points: number, reference: string) {
    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { id: customerId } });
      if (customer.loyaltyPoints < points) throw new Error('Insufficient points');

      await tx.loyaltyTransaction.create({
        data: { customerId, points: -points, type: 'REDEEMED', reference },
      });
      return tx.customer.update({
        where: { id: customerId },
        data: { loyaltyPoints: { decrement: points } },
      });
    });
  }

  async addTransaction(customerId: string, type: string, amount: number, notes?: string) {
    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { id: customerId } });
      const newBalance = type === 'CREDIT' ? customer.currentDebt + amount : customer.currentDebt - amount;

      await tx.customerTransaction.create({
        data: { customerId, type, amount, balance: newBalance, notes },
      });
      return tx.customer.update({
        where: { id: customerId },
        data: { currentDebt: newBalance },
      });
    });
  }
}
