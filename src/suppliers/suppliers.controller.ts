import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { Roles } from '../common/decorators';

@Controller('suppliers')
export class SuppliersController {
  constructor(private service: SuppliersService) {}

  @Post()
  @Roles('BOSS', 'MANAGER')
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.service.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.service.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @Roles('BOSS', 'MANAGER')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @Roles('BOSS', 'MANAGER')
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }
}
