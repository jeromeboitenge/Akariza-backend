import { Controller, Get, Post, Body, Patch, Param, Request } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { Roles } from '../common/decorators';

@Controller('purchase-orders')
@Roles('BOSS', 'MANAGER')
export class PurchaseOrdersController {
  constructor(private service: PurchaseOrdersService) {}

  @Post()
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId, req.user.id);
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
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Post(':id/approve')
  @Roles('BOSS')
  approve(@Param('id') id: string, @Request() req) {
    return this.service.approve(id, req.user.id);
  }

  @Post(':id/convert')
  convertToPurchase(@Param('id') id: string, @Request() req) {
    return this.service.convertToPurchase(id, req.user.id);
  }
}
