import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Roles } from '../common/decorators';

@Controller('tasks')
export class TasksController {
  constructor(private service: TasksService) {}

  @Post()
  @Roles('BOSS', 'MANAGER')
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId, req.user.id);
  }

  @Get()
  findAll(@Query('userId') userId: string, @Request() req) {
    return this.service.findAll(req.user.organizationId, userId);
  }

  @Get('my-tasks')
  findMyTasks(@Request() req) {
    return this.service.findAll(req.user.organizationId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @Roles('BOSS', 'MANAGER')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Post(':id/comments')
  addComment(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.service.addComment(id, req.user.id, data.comment);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string) {
    return this.service.complete(id);
  }
}
