import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Roles } from '../common/decorators';

@Controller('products')
export class ProductsController {
  constructor(private service: ProductsService) {}

  @Post()
  @Roles('BOSS', 'MANAGER')
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.service.findAll(req.user.organizationId);
  }

  @Get('low-stock')
  findLowStock(@Request() req) {
    return this.service.findLowStock(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.service.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @Roles('BOSS', 'MANAGER')
  update(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.service.update(id, req.user.organizationId, data);
  }

  @Delete(':id')
  @Roles('BOSS', 'MANAGER')
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }
}
