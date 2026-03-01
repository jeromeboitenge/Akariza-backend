import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AdminDashboardService } from './admin-dashboard.service';
import { Roles } from '../common/decorators';

@ApiTags('Admin - Dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('admin/dashboard')
@Roles('SYSTEM_ADMIN')
export class AdminDashboardController {
  constructor(private service: AdminDashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'System-wide overview statistics' })
  getOverview() {
    return this.service.getSystemOverview();
  }

  @Get('organizations/stats')
  @ApiOperation({ summary: 'Statistics for all organizations' })
  getOrganizationsStats() {
    return this.service.getOrganizationsStats();
  }

  @Get('organizations/:id/stats')
  @ApiOperation({ summary: 'Detailed statistics for specific organization' })
  @ApiParam({ name: 'id', example: 'org-uuid' })
  getOrganizationDetails(@Param('id') id: string) {
    return this.service.getOrganizationDetails(id);
  }

  @Get('sales')
  @ApiOperation({ summary: 'System-wide sales statistics' })
  @ApiQuery({ name: 'startDate', required: false, example: '2026-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2026-12-31' })
  getSalesStats(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.service.getSalesStats(startDate, endDate);
  }

  @Get('products/top-selling')
  @ApiOperation({ summary: 'Top selling products across all organizations' })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  getTopProducts(@Query('limit') limit?: string) {
    return this.service.getTopProducts(limit ? parseInt(limit) : 20);
  }

  @Get('users/activity')
  @ApiOperation({ summary: 'User activity across system' })
  getUserActivity() {
    return this.service.getUserActivity();
  }

  @Get('branches/stats')
  @ApiOperation({ summary: 'Branch statistics across all organizations' })
  getBranchesStats() {
    return this.service.getBranchesStats();
  }
}
