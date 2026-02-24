import { Controller, Get, Post, Query, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../common/decorators';

@Controller('analytics')
@Roles('BOSS', 'MANAGER')
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}

  @Get('dashboard')
  getDashboard(@Query('branchId') branchId: string, @Request() req) {
    return this.service.getDashboard(req.user.organizationId, branchId);
  }

  @Get('inventory-turnover')
  getInventoryTurnover(@Query('days') days: string, @Request() req) {
    return this.service.getInventoryTurnover(req.user.organizationId, days ? parseInt(days) : 30);
  }

  @Get('customer-insights')
  getCustomerInsights(@Request() req) {
    return this.service.getCustomerInsights(req.user.organizationId);
  }

  @Get('branch-comparison')
  getBranchComparison(@Query('startDate') startDate: string, @Query('endDate') endDate: string, @Request() req) {
    return this.service.getBranchComparison(
      req.user.organizationId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('employee-performance')
  getEmployeePerformance(@Query('month') month: string, @Request() req) {
    return this.service.getEmployeePerformance(req.user.organizationId, new Date(month));
  }

  @Post('daily-summary')
  @Roles('BOSS')
  createDailySummary(@Query('date') date: string, @Query('branchId') branchId: string, @Request() req) {
    return this.service.createDailySummary(req.user.organizationId, new Date(date), branchId);
  }
}
