import { Controller, Get, Post, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../common/decorators';

@ApiTags('Analytics')
@ApiBearerAuth('JWT-auth')
@Controller('analytics')
@Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER')
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get real-time dashboard with key metrics' })
  @ApiQuery({ name: 'branchId', required: false })
  getDashboard(@Query('branchId') branchId: string, @Request() req) {
    return this.service.getDashboard(req.user.organizationId, branchId);
  }

  @Get('sales-trends')
  @ApiOperation({ summary: 'Get sales trends over time' })
  @ApiQuery({ name: 'period', required: false, enum: ['daily', 'weekly', 'monthly'], example: 'daily' })
  @ApiQuery({ name: 'days', required: false, example: 7 })
  getSalesTrends(
    @Query('period') period: 'daily' | 'weekly' | 'monthly',
    @Query('days') days: string,
    @Request() req
  ) {
    return this.service.getSalesTrends(
      req.user.organizationId,
      period || 'daily',
      days ? parseInt(days) : 7
    );
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Get top selling products' })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'days', required: false, example: 30 })
  getTopProducts(@Query('limit') limit: string, @Query('days') days: string, @Request() req) {
    return this.service.getTopProducts(
      req.user.organizationId,
      limit ? parseInt(limit) : 10,
      days ? parseInt(days) : 30
    );
  }

  @Get('low-stock-alerts')
  @ApiOperation({ summary: 'Get low stock alerts with predictions' })
  getLowStockAlerts(@Request() req) {
    return this.service.getLowStockAlerts(req.user.organizationId);
  }

  @Get('revenue-by-category')
  @ApiOperation({ summary: 'Get revenue breakdown by product category' })
  @ApiQuery({ name: 'startDate', required: true, example: '2026-02-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2026-02-28' })
  getRevenueByCategory(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req
  ) {
    return this.service.getRevenueByCategory(
      req.user.organizationId,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('payment-methods')
  @ApiOperation({ summary: 'Get payment method breakdown' })
  @ApiQuery({ name: 'startDate', required: true, example: '2026-02-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2026-02-28' })
  getPaymentMethodBreakdown(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req
  ) {
    return this.service.getPaymentMethodBreakdown(
      req.user.organizationId,
      new Date(startDate),
      new Date(endDate)
    );
  }
}
