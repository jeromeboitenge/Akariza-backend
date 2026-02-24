import { Controller, Get, Post, Body, Patch, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('messages')
export class MessagesController {
  constructor(private service: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send message' })
  @ApiBody({
    schema: {
      example: {
        receiverId: 'user-id',
        message: 'Hello, please check the inventory report'
      }
    }
  })
  create(@Body() data: any, @Request() req) {
    return this.service.create(req.user.id, data.receiverId, data.message, req.user.organizationId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all messages' })
  findAll(@Request() req) {
    return this.service.findAll(req.user.organizationId, req.user.id);
  }

  @Get('conversation/:userId')
  @ApiOperation({ summary: 'Get conversation with user' })
  findConversation(@Param('userId') userId: string, @Request() req) {
    return this.service.findConversation(req.user.id, userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  markAsRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count' })
  getUnreadCount(@Request() req) {
    return this.service.getUnreadCount(req.user.id);
  }
}
