import { Controller, Get, Query, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('sales/daily')
  getDailySales(@Query('date') date: string, @Request() req) {
    const targetDate = date ? new Date(date) : new Date();
    return this.service.getDailySales(req.user.organizationId, targetDate);
  }

  @Get('sales/monthly')
  getMonthlySales(@Query('month') month: string, @Request() req) {
    const date = month ? new Date(month) : new Date();
    return this.service.getMonthlySales(req.user.organizationId, date.getFullYear(), date.getMonth() + 1);
  }

  @Get('profit')
  getProfitReport(@Query('startDate') startDate: string, @Query('endDate') endDate: string, @Request() req) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate) : new Date();
    return this.service.getProfitReport(req.user.organizationId, start, end);
  }

  @Get('best-selling')
  getBestSelling(@Query('limit') limit: string, @Request() req) {
    return this.service.getBestSelling(req.user.organizationId, limit ? parseInt(limit) : 10);
  }

  @Get('low-stock')
  getLowStock(@Request() req) {
    return this.service.getLowStock(req.user.organizationId);
  }
}
