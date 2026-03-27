import { Controller, Get, Post, Body, Delete, Param, Query, Request , UseGuards} from '@nestjs/common';
import { OrganizationContextGuard } from '../common/organization-context.guard';
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { Roles } from '../common/decorators';

@ApiTags('Expenses')
@ApiBearerAuth()
@Controller('expenses')
@UseGuards(OrganizationContextGuard)
@Roles('BOSS', 'MANAGER', 'CASHIER', 'SYSTEM_ADMIN')
export class ExpensesController {
  constructor(private service: ExpensesService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Record daily expense',
    description: 'Cashier records daily expenses like transport, cleaning supplies, etc.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['category', 'amount', 'description', 'date'],
      properties: {
        category: {
          type: 'string',
          enum: [
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
          ],
          example: 'TRANSPORT',
          description: 'Expense category'
        },
        amount: {
          type: 'number',
          example: 5000,
          description: 'Amount spent'
        },
        description: {
          type: 'string',
          example: 'Taxi to bank',
          description: 'What the money was spent on'
        },
        date: {
          type: 'string',
          format: 'date',
          example: '2026-02-26',
          description: 'Date of expense'
        },
        paymentMethod: {
          type: 'string',
          enum: ['CASH', 'MOBILE', 'BANK_TRANSFER', 'CARD'],
          example: 'CASH',
          description: 'How payment was made'
        },
        receiptUrl: {
          type: 'string',
          example: 'https://example.com/receipt.jpg',
          description: 'Optional receipt photo URL'
        },
        customCategory: {
          type: 'string',
          example: 'SECURITY',
          description: 'Required when category is OTHER. Will be saved for future use.'
        }
      },
      examples: {
        transport: {
          summary: 'Transport Expense',
          value: {
            category: 'TRANSPORT',
            amount: 5000,
            description: 'Taxi to bank',
            date: '2026-02-26',
            paymentMethod: 'CASH'
          }
        },
        supplies: {
          summary: 'Cleaning Supplies',
          value: {
            category: 'SUPPLIES',
            amount: 15000,
            description: 'Cleaning materials',
            date: '2026-02-26',
            paymentMethod: 'CASH'
          }
        },
        customCategory: {
          summary: 'Custom Category (e.g., Security)',
          value: {
            category: 'OTHER',
            customCategory: 'SECURITY',
            amount: 50000,
            description: 'Security guard payment',
            date: '2026-02-26',
            paymentMethod: 'CASH'
          }
        },
        utilities: {
          summary: 'Electricity Bill',
          value: {
            category: 'UTILITIES',
            amount: 150000,
            description: 'Electricity bill - February',
            date: '2026-02-24',
            paymentMethod: 'BANK_TRANSFER'
          }
        }
      }
    }
  })
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId, req.user.id);
  }

  @Get('categories')
  @ApiOperation({ 
    summary: 'Get all expense categories',
    description: 'Returns default categories + custom categories added by users'
  })
  getCategories(@Request() req) {
    return this.service.getCategories(req.user.organizationId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses' })
  @ApiQuery({ name: 'startDate', required: false, example: '2026-02-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2026-02-28' })
  findAll(@Query('startDate') startDate: string, @Query('endDate') endDate: string, @Request() req) {
    return this.service.findAll(
      req.user.organizationId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get expenses summary' })
  @ApiQuery({ name: 'startDate', required: false, example: '2026-02-01', description: 'Start date (defaults to start of current month)' })
  @ApiQuery({ name: 'endDate', required: false, example: '2026-02-28', description: 'End date (defaults to end of current month)' })
  getSummary(@Query('startDate') startDate: string, @Query('endDate') endDate: string, @Request() req) {
    // Default to current month if dates not provided
    const now = new Date();
    const defaultStartDate = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultEndDate = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return this.service.getSummary(req.user.organizationId, defaultStartDate, defaultEndDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @Roles('BOSS', 'SYSTEM_ADMIN')
  @ApiOperation({ summary: 'Delete expense' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
