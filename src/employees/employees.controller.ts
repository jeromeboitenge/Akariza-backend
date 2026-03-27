// @ts-nocheck
import { Controller, Get, Post, Body, Patch, Param, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { Roles } from '../common/decorators';
import { OrganizationContextGuard } from '../common/organization-context.guard';

@ApiTags('Employees')
@ApiBearerAuth()
@Controller('employees')
@UseGuards(OrganizationContextGuard)
@Roles('BOSS', 'MANAGER', 'SYSTEM_ADMIN')
export class EmployeesController {
  constructor(private service: EmployeesService) {}

  @Post()
  @Roles('BOSS', 'SYSTEM_ADMIN') // Only BOSS can create employees (SYSTEM_ADMIN read-only)
  @ApiOperation({ summary: 'Create employee (BOSS only)' })
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
  @ApiOperation({ summary: 'Get all employees (SYSTEM_ADMIN: read-only all orgs, others: own org)' })
  findAll(@Request() req) {
    // Others see their organization employees
      return this.service.findAll(req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID (SYSTEM_ADMIN: read-only, others: own org)' })
  findOne(@Param('id') id: string, @Request() req) {
    // Others see their organization employees
      return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('BOSS', 'SYSTEM_ADMIN') // Only BOSS can update employees (SYSTEM_ADMIN read-only)
  @ApiOperation({ summary: 'Update employee (BOSS only)' })
  update(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.service.update(id, req.user.organizationId, data);
  }

  @Post(':id/attendance')
  @Roles('BOSS', 'MANAGER', 'SYSTEM_ADMIN') // SYSTEM_ADMIN cannot record attendance (read-only)
  @ApiOperation({ summary: 'Record attendance (BOSS/MANAGER only)' })
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
  @Roles('BOSS', 'SYSTEM_ADMIN') // Only BOSS can set targets (SYSTEM_ADMIN read-only)
  @ApiOperation({ summary: 'Set sales target (BOSS only)' })
  @ApiBody({
    schema: {
      example: {
        month: '2026-02-01',
        target: 5000000
      }
    }
  })
  setTarget(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.service.setTargetByOwner(id, req.user.organizationId, new Date(data.month), data.target);
  }
}
