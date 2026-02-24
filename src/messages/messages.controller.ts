import { Controller, Get, Post, Body, Patch, Param, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private service: MessagesService) {}

  @Post()
  create(@Body() data: any, @Request() req) {
    return this.service.create(req.user.id, data.receiverId, data.message, req.user.organizationId);
  }

  @Get()
  findAll(@Request() req) {
    return this.service.findAll(req.user.organizationId, req.user.id);
  }

  @Get('conversation/:userId')
  findConversation(@Param('userId') userId: string, @Request() req) {
    return this.service.findConversation(req.user.id, userId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }

  @Get('unread-count')
  getUnreadCount(@Request() req) {
    return this.service.getUnreadCount(req.user.id);
  }
}
