import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request , UseGuards} from '@nestjs/common';
import { OrganizationContextGuard } from '../common/organization-context.guard';
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { Roles } from '../common/decorators';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(OrganizationContextGuard)
export class TasksController {
  constructor(private service: TasksService) {}

  @Post()
  @Roles('BOSS', 'MANAGER', 'SYSTEM_ADMIN')
  @ApiOperation({ summary: 'Create task' })
  @ApiBody({
    schema: {
      example: {
        title: 'Update inventory count',
        description: 'Count all products in warehouse',
        assignedToId: 'user-id',
        dueDate: '2026-02-28',
        priority: 'HIGH'
      }
    }
  })
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiQuery({ name: 'userId', required: false })
  findAll(@Query('userId') userId: string, @Request() req) {
    return this.service.findAll(req.user.organizationId, userId);
  }

  @Get('my-tasks')
  @ApiOperation({ summary: 'Get my tasks' })
  findMyTasks(@Request() req) {
    return this.service.findAll(req.user.organizationId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @Roles('BOSS', 'MANAGER', 'SYSTEM_ADMIN')
  @ApiOperation({ summary: 'Delete task' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add comment to task' })
  @ApiBody({
    schema: {
      example: { comment: 'Work in progress, 50% done' }
    }
  })
  addComment(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.service.addComment(id, req.user.id, data.comment);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark task as complete' })
  complete(@Param('id') id: string) {
    return this.service.complete(id);
  }
}
