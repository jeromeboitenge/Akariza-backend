import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { SalesService } from './sales.service';
import { Roles } from '../common/decorators';

@Controller('sales')
export class SalesController {
  constructor(private service: SalesService) {}

  @Post()
  @Roles('BOSS', 'MANAGER', 'CASHIER')
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId, req.user.id);
  }

  @Get()
  @Roles('BOSS', 'MANAGER', 'CASHIER')
  findAll(@Request() req) {
    return this.service.findAll(req.user.organizationId);
  }

  @Get('my-sales')
  @Roles('CASHIER')
  findMySales(@Request() req) {
    return this.service.findMySales(req.user.organizationId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.service.findOne(id, req.user.organizationId);
  }
}
