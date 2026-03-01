import { Controller, Get, Patch, Delete, Param, Request, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { Roles } from '../common/decorators';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  findAll(@Request() req) {
    return this.service.findAll(req.user.id);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread notifications' })
  findUnread(@Request() req) {
    return this.service.findUnread(req.user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread count' })
  getUnreadCount(@Request() req) {
    return this.service.getUnreadCount(req.user.id);
  }

  @Post('check-low-stock')
  @Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER')
  @ApiOperation({ summary: 'Trigger low stock notifications' })
  checkLowStock(@Request() req) {
    return this.service.notifyLowStock(req.user.organizationId);
  }

  @Post('check-expiring')
  @Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER')
  @ApiOperation({ summary: 'Trigger expiring products notifications' })
  checkExpiring(@Request() req) {
    return this.service.notifyExpiringProducts(req.user.organizationId);
  }

  @Post('check-debt')
  @Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER')
  @ApiOperation({ summary: 'Trigger high debt notifications' })
  checkDebt(@Request() req) {
    return this.service.notifyHighDebt(req.user.organizationId);
  }

  @Post('check-deadlines')
  @Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER')
  @ApiOperation({ summary: 'Trigger task deadline notifications' })
  checkDeadlines(@Request() req) {
    return this.service.notifyUpcomingDeadlines(req.user.organizationId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark as read' })
  markAsRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all as read' })
  markAllAsRead(@Request() req) {
    return this.service.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all notifications' })
  deleteAll(@Request() req) {
    return this.service.deleteAll(req.user.id);
  }
}
