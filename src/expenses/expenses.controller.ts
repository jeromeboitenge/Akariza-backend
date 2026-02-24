import { Controller, Get, Post, Body, Delete, Param, Query, Request } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { Roles } from '../common/decorators';

@Controller('expenses')
@Roles('BOSS', 'MANAGER')
export class ExpensesController {
  constructor(private service: ExpensesService) {}

  @Post()
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId, req.user.id);
  }

  @Get()
  findAll(@Query('startDate') startDate: string, @Query('endDate') endDate: string, @Request() req) {
    return this.service.findAll(
      req.user.organizationId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('summary')
  getSummary(@Query('startDate') startDate: string, @Query('endDate') endDate: string, @Request() req) {
    return this.service.getSummary(req.user.organizationId, new Date(startDate), new Date(endDate));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @Roles('BOSS')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
