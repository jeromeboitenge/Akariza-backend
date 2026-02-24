import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { Roles } from '../common/decorators';

@Controller('promotions')
@Roles('BOSS', 'MANAGER')
export class PromotionsController {
  constructor(private service: PromotionsService) {}

  @Post()
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId);
  }

  @Get()
  findAll(@Request() req) {
    return this.service.findAll(req.user.organizationId);
  }

  @Get('active')
  findActive(@Request() req) {
    return this.service.findActive(req.user.organizationId);
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
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }
}
