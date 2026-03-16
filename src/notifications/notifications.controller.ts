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
    // Temporary placeholder - return empty array until service is complete
    return { notifications: [], total: 0 };
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread notifications' })
  findUnread(@Request() req) {
    // Temporary placeholder - return empty array until service is complete
    return { notifications: [], count: 0 };
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
    // Temporary placeholder - return success message
    return { message: 'Low stock check completed', count: 0 };
  }

  @Post('check-expiring')
  @Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER')
  @ApiOperation({ summary: 'Trigger expiring products notifications' })
  checkExpiring(@Request() req) {
    // Temporary placeholder - return success message
    return { message: 'Expiring products check completed', count: 0 };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark as read' })
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.service.markAsRead(id, req.user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all as read' })
  markAllAsRead(@Request() req) {
    return this.service.markAllAsRead(req.user.id);
  }
}
