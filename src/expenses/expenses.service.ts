import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  create(data: any, organizationId: string, userId: string) {
    return this.prisma.expense.create({
      data: { ...data, organizationId, createdById: userId, date: new Date(data.date) },
    });
  }

  findAll(organizationId: string, startDate?: Date, endDate?: Date) {
    return this.prisma.expense.findMany({
      where: {
        organizationId,
        ...(startDate && endDate && { date: { gte: startDate, lte: endDate } }),
      },
      orderBy: { date: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.expense.findUnique({ where: { id } });
  }

  delete(id: string) {
    return this.prisma.expense.delete({ where: { id } });
  }

  async getSummary(organizationId: string, startDate: Date, endDate: Date) {
    const expenses = await this.prisma.expense.findMany({
      where: { organizationId, date: { gte: startDate, lte: endDate } },
    });

    const byCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    return {
      total: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      byCategory,
      count: expenses.length,
    };
  }
}
