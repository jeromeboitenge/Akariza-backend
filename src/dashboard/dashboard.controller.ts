import { Controller, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get role-based dashboard',
    description: 'Returns different dashboard data based on user role (CASHIER, MANAGER, BOSS)'
  })
  async getDashboard(@Request() req) {
    const { role, id, organizationId, branchId } = req.user;

    switch (role) {
      case 'CASHIER':
        return this.service.getCashierDashboard(id, organizationId, branchId);
      
      case 'MANAGER':
        return this.service.getManagerDashboard(id, organizationId, branchId);
      
      case 'BOSS':
      case 'SYSTEM_ADMIN':
        return this.service.getBossDashboard(organizationId);
      
      default:
        return { error: 'Invalid role' };
    }
  }
}
