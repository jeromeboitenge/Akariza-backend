import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private service: CustomersService) {}

  @Post()
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId);
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
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }

  @Post(':id/loyalty/add')
  addLoyalty(@Param('id') id: string, @Body() data: any) {
    return this.service.addLoyaltyPoints(id, data.points, data.reference);
  }

  @Post(':id/loyalty/redeem')
  redeemLoyalty(@Param('id') id: string, @Body() data: any) {
    return this.service.redeemLoyaltyPoints(id, data.points, data.reference);
  }

  @Post(':id/transactions')
  addTransaction(@Param('id') id: string, @Body() data: any) {
    return this.service.addTransaction(id, data.type, data.amount, data.notes);
  }
}
