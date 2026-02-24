import { Controller, Get, Patch, Delete, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

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
}
