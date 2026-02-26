import { Controller, Get, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { Roles } from '../common/decorators';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('sales/daily')
  @ApiOperation({ summary: 'Get daily sales report' })
  @ApiQuery({ name: 'date', required: false, example: '2026-02-24' })
  getDailySales(@Query('date') date: string, @Request() req) {
    const targetDate = date ? new Date(date) : new Date();
    return this.service.getDailySales(req.user.organizationId, targetDate);
  }

  @Get('sales/monthly')
  @ApiOperation({ summary: 'Get monthly sales report' })
  @ApiQuery({ name: 'month', required: false, example: '2026-02-01' })
  getMonthlySales(@Query('month') month: string, @Request() req) {
    const date = month ? new Date(month) : new Date();
    return this.service.getMonthlySales(req.user.organizationId, date.getFullYear(), date.getMonth() + 1);
  }

  @Get('profit')
  @ApiOperation({ summary: 'Get profit report' })
  @ApiQuery({ name: 'startDate', required: false, example: '2026-02-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2026-02-28' })
  getProfitReport(@Query('startDate') startDate: string, @Query('endDate') endDate: string, @Request() req) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate) : new Date();
    return this.service.getProfitReport(req.user.organizationId, start, end);
  }

  @Get('best-selling')
  @ApiOperation({ summary: 'Get best-selling products' })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  getBestSelling(@Query('limit') limit: string, @Request() req) {
    return this.service.getBestSelling(req.user.organizationId, limit ? parseInt(limit) : 10);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock products' })
  getLowStock(@Request() req) {
    return this.service.getLowStock(req.user.organizationId);
  }
}
