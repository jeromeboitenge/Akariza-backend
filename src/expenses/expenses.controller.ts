import { Controller, Get, Post, Body, Delete, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { Roles } from '../common/decorators';

@ApiTags('Expenses')
@ApiBearerAuth()
@Controller('expenses')
@Roles('BOSS', 'MANAGER')
export class ExpensesController {
  constructor(private service: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create expense' })
  @ApiBody({
    schema: {
      example: {
        category: 'UTILITIES',
        amount: 150000,
        description: 'Electricity bill - February',
        date: '2026-02-24',
        paymentMethod: 'BANK_TRANSFER',
        reference: 'INV-2024-02'
      }
    }
  })
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId, req.user.id);
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
  @ApiQuery({ name: 'startDate', required: true, example: '2026-02-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2026-02-28' })
  getSummary(@Query('startDate') startDate: string, @Query('endDate') endDate: string, @Request() req) {
    return this.service.getSummary(req.user.organizationId, new Date(startDate), new Date(endDate));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @Roles('BOSS')
  @ApiOperation({ summary: 'Delete expense' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
