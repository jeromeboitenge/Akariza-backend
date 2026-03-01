import { Controller, Get, Post, Body, Patch, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { Roles } from '../common/decorators';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('messages')
export class MessagesController {
  constructor(private service: MessagesService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Send message',
    description: 'CASHIER: message within branch, MANAGER: message own branches, BOSS: message all branches'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['targetType', 'message'],
      properties: {
        targetType: {
          type: 'string',
          enum: ['USER', 'BRANCH', 'ALL_BRANCHES'],
          description: 'USER = specific user, BRANCH = all users in branch, ALL_BRANCHES = all users in org (BOSS only)'
        },
        receiverId: {
          type: 'string',
          description: 'Required when targetType is USER'
        },
        receiverBranchId: {
          type: 'string',
          description: 'Required when targetType is BRANCH'
        },
        message: {
          type: 'string',
          example: 'Please check the inventory report'
        }
      },
      examples: {
        toUser: {
          summary: 'Message to specific user (Cashier to Cashier)',
          value: {
            targetType: 'USER',
            receiverId: 'user-id',
            message: 'Can you help with customer at counter 2?'
          }
        },
        toBranch: {
          summary: 'Message to branch (Manager to their branch)',
          value: {
            targetType: 'BRANCH',
            receiverBranchId: 'branch-id',
            message: 'Team meeting at 3 PM today'
          }
        },
        toAllBranches: {
          summary: 'Message to all branches (BOSS only)',
          value: {
            targetType: 'ALL_BRANCHES',
            message: 'New promotion starts tomorrow - 10% off all items'
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
  @ApiOperation({ 
    summary: 'Get messages',
    description: 'CASHIER: own messages, MANAGER: branch messages, BOSS: all messages'
  })
  findAll(@Request() req) {
    return this.service.findAll(
      req.user.organizationId,
      req.user.id,
      req.user.role,
      req.user.branchId
    );
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
    return this.service.getUnreadCount(req.user.id, req.user.role, req.user.branchId);
  }

  @Get(':id/audit-trail')
  @ApiOperation({ 
    summary: 'Get message audit trail (NON-REPUDIATION)',
    description: 'Returns complete message history with all metadata for legal/compliance purposes'
  })
  @Roles('SYSTEM_ADMIN', 'BOSS')
  getAuditTrail(@Param('id') id: string, @Request() req) {
    return this.service.getMessageAuditTrail(id, req.user.organizationId);
  }
}
