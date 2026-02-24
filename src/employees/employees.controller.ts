import { Controller, Get, Post, Body, Patch, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { Roles } from '../common/decorators';

@ApiTags('Employees')
@ApiBearerAuth()
@Controller('employees')
@Roles('BOSS', 'MANAGER')
export class EmployeesController {
  constructor(private service: EmployeesService) {}

  @Post()
  @Roles('BOSS')
  @ApiOperation({ summary: 'Create employee' })
  @ApiBody({
    schema: {
      example: {
        userId: 'user-id',
        position: 'Sales Manager',
        department: 'Sales',
        salary: 500000,
        hireDate: '2026-01-01',
        employmentType: 'FULL_TIME'
      }
    }
  })
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  findAll(@Request() req) {
    return this.service.findAll(req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('BOSS')
  @ApiOperation({ summary: 'Update employee' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Post(':id/attendance')
  @ApiOperation({ summary: 'Record attendance' })
  @ApiBody({
    schema: {
      example: {
        date: '2026-02-24',
        checkIn: '08:00',
        checkOut: '17:00'
      }
    }
  })
  recordAttendance(@Param('id') id: string, @Body() data: any) {
    return this.service.recordAttendance(id, new Date(data.date), data.checkIn, data.checkOut);
  }

  @Post(':id/targets')
  @Roles('BOSS')
  @ApiOperation({ summary: 'Set sales target' })
  @ApiBody({
    schema: {
      example: {
        month: '2026-02-01',
        target: 5000000
      }
    }
  })
  setTarget(@Param('id') id: string, @Body() data: any) {
    return this.service.setTarget(id, new Date(data.month), data.target);
  }
}
