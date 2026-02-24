import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { Roles } from '../common/decorators';

@Controller('purchases')
@Roles('BOSS', 'MANAGER')
export class PurchasesController {
  constructor(private service: PurchasesService) {}

  @Post()
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
}
