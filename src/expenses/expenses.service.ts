import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, organizationId: string, userId: string) {
    // If category is "OTHER" and customCategory is provided, save it
    let category = data.category;
    
    if (data.category === 'OTHER' && data.customCategory) {
      const customCategoryName = data.customCategory.toUpperCase().trim();
      
      // Check if custom category already exists
      let existingCategory = await this.prisma.expenseCategory.findUnique({
        where: {
          organizationId_name: {
            organizationId,
            name: customCategoryName
          }
        }
      });
      
      // If not, create it
      if (!existingCategory) {
        existingCategory = await this.prisma.expenseCategory.create({
          data: {
            organizationId,
            name: customCategoryName,
            isDefault: false
          }
        });
      }
      
      category = customCategoryName;
    }
    
    // Remove customCategory from data as it's not a field in the Expense model
    const { customCategory, ...expenseData } = data;
    
    return this.prisma.expense.create({
      data: { 
        ...expenseData, 
        category,
        organizationId, 
        createdById: userId, 
        date: new Date(expenseData.date) 
      },
    });
  }

  async getCategories(organizationId: string) {
    // Get default categories
    const defaultCategories = [
      'RENT',
      'UTILITIES',
      'SALARIES',
      'TRANSPORT',
      'SUPPLIES',
      'MAINTENANCE',
      'MARKETING',
      'INSURANCE',
      'TAXES',
      'OTHER'
    ];
    
    // Get custom categories for this organization
    const customCategories = await this.prisma.expenseCategory.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' }
    });
    
    return {
      default: defaultCategories,
      custom: customCategories.map(c => c.name),
      all: [...defaultCategories, ...customCategories.map(c => c.name)]
    };
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
