import { Controller, Get, Post, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../common/decorators';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@Roles('BOSS', 'MANAGER')
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get analytics dashboard' })
  @ApiQuery({ name: 'branchId', required: false })
  getDashboard(@Query('branchId') branchId: string, @Request() req) {
    return this.service.getDashboard(req.user.organizationId, branchId);
  }

  @Get('inventory-turnover')
  @ApiOperation({ summary: 'Get inventory turnover rate' })
  @ApiQuery({ name: 'days', required: false, example: 30 })
  getInventoryTurnover(@Query('days') days: string, @Request() req) {
    return this.service.getInventoryTurnover(req.user.organizationId, days ? parseInt(days) : 30);
  }

  @Get('customer-insights')
  @ApiOperation({ summary: 'Get customer insights' })
  getCustomerInsights(@Request() req) {
    return this.service.getCustomerInsights(req.user.organizationId);
  }

  @Get('branch-comparison')
  @ApiOperation({ summary: 'Compare branch performance' })
  @ApiQuery({ name: 'startDate', required: true, example: '2026-02-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2026-02-28' })
  getBranchComparison(@Query('startDate') startDate: string, @Query('endDate') endDate: string, @Request() req) {
    return this.service.getBranchComparison(
      req.user.organizationId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('employee-performance')
  @ApiOperation({ summary: 'Get employee performance' })
  @ApiQuery({ name: 'month', required: true, example: '2026-02-01' })
  getEmployeePerformance(@Query('month') month: string, @Request() req) {
    return this.service.getEmployeePerformance(req.user.organizationId, new Date(month));
  }

  @Post('daily-summary')
  @Roles('BOSS')
  @ApiOperation({ summary: 'Create daily summary' })
  @ApiQuery({ name: 'date', required: true, example: '2026-02-24' })
  @ApiQuery({ name: 'branchId', required: false })
  createDailySummary(@Query('date') date: string, @Query('branchId') branchId: string, @Request() req) {
    return this.service.createDailySummary(req.user.organizationId, new Date(date), branchId);
  }
}
