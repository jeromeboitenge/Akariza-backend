import { Controller, Get, Post, Body, Patch, Param, Request } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Roles } from '../common/decorators';

@Controller('employees')
@Roles('BOSS', 'MANAGER')
export class EmployeesController {
  constructor(private service: EmployeesService) {}

  @Post()
  @Roles('BOSS')
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId);
  }

  @Get()
  findAll(@Request() req) {
    return this.service.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('BOSS')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Post(':id/attendance')
  recordAttendance(@Param('id') id: string, @Body() data: any) {
    return this.service.recordAttendance(id, new Date(data.date), data.checkIn, data.checkOut);
  }

  @Post(':id/targets')
  @Roles('BOSS')
  setTarget(@Param('id') id: string, @Body() data: any) {
    return this.service.setTarget(id, new Date(data.month), data.target);
  }
}
