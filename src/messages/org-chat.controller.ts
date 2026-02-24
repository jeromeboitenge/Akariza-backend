import { Controller, Get, Post, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { OrgChatService } from './org-chat.service';

@ApiTags('Organization Chat')
@ApiBearerAuth()
@Controller('org-chat')
export class OrgChatController {
  constructor(private service: OrgChatService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send message in organization chat' })
  @ApiBody({
    schema: {
      examples: {
        'Broadcast to All': {
          value: {
            message: 'Team meeting at 3 PM today!'
          }
        },
        'Direct Message': {
          value: {
            recipientId: 'user-id',
            message: 'Can you check the inventory report?'
          }
        }
      }
    }
  })
  sendMessage(@Body() data: any, @Request() req) {
    return this.service.sendMessage(
      req.user.organizationId,
      req.user.id,
      data.message,
      data.recipientId,
    );
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get organization chat messages' })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  getMessages(@Query('limit') limit: string, @Request() req) {
    return this.service.getOrgMessages(req.user.organizationId, limit ? parseInt(limit) : 50);
  }

  @Get('conversation/:userId')
  @ApiOperation({ summary: 'Get conversation with specific user' })
  getConversation(@Param('userId') userId: string, @Request() req) {
    return this.service.getConversation(req.user.organizationId, req.user.id, userId);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users in organization' })
  getOrgUsers(@Request() req) {
    return this.service.getOrgUsers(req.user.organizationId);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.service.markAsRead(id, req.user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count' })
  getUnreadCount(@Request() req) {
    return this.service.getUnreadCount(req.user.organizationId, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete message' })
  deleteMessage(@Param('id') id: string, @Request() req) {
    return this.service.deleteMessage(id, req.user.id);
  }
}
