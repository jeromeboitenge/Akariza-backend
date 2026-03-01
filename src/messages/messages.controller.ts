import { Controller, Get, Post, Body, Patch, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { Roles } from '../common/decorators';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('messages')
export class MessagesController {
  constructor(private service: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send message' })
  @ApiBody({
    schema: {
      examples: {
        'Direct Message': {
          value: {
            receiverId: 'user-id',
            message: 'Can you check the inventory?'
          }
        },
        'Branch Message (Manager)': {
          value: {
            targetType: 'BRANCH',
            receiverBranchId: 'branch-id',
            message: 'Team meeting at 3 PM'
          }
        },
        'Organization Broadcast (Boss)': {
          value: {
            targetType: 'ALL_BRANCHES',
            message: 'New promotion starts tomorrow'
          }
        }
      }
    }
  })
  create(@Body() data: any, @Request() req) {
    return this.service.create(
      data,
      req.user.organizationId,
      req.user.id,
      req.user.role,
      req.user.branchId
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get my messages' })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  findAll(@Query('limit') limit: string, @Request() req) {
    return this.service.findAll(
      req.user.organizationId,
      req.user.id,
      req.user.role,
      req.user.branchId,
      limit ? parseInt(limit) : 50
    );
  }

  @Get('conversation/:userId')
  @ApiOperation({ summary: 'Get conversation with user' })
  findConversation(@Param('userId') userId: string, @Request() req) {
    return this.service.findConversation(req.user.id, userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread count' })
  getUnreadCount(@Request() req) {
    return this.service.getUnreadCount(req.user.id, req.user.role, req.user.branchId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark as read' })
  markAsRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }
}
