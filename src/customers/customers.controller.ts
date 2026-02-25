import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { Roles } from '../common/decorators';

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private service: CustomersService) {}

  @Post()
  @Roles('BOSS', 'MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'Create customer' })
  @ApiBody({
    schema: {
      example: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+250788123456',
        address: 'Kigali, Rwanda',
        loyaltyEnabled: true
      }
    }
  })
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId);
  }

  @Get()
  @Roles('BOSS', 'MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'Get all customers' })
  findAll(@Request() req) {
    return this.service.findAll(req.user.organizationId);
  }

  @Get(':id')
  @Roles('BOSS', 'MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'Get customer by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.service.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @Roles('BOSS', 'MANAGER')
  @ApiOperation({ summary: 'Update customer' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @Roles('BOSS', 'MANAGER')
  @ApiOperation({ summary: 'Deactivate customer' })
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }

  @Post(':id/loyalty/add')
  @Roles('BOSS', 'MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'Add loyalty points' })
  @ApiBody({
    schema: {
      example: { points: 100, reference: 'Purchase #123' }
    }
  })
  addLoyalty(@Param('id') id: string, @Body() data: any) {
    return this.service.addLoyaltyPoints(id, data.points, data.reference);
  }

  @Post(':id/loyalty/redeem')
  @Roles('BOSS', 'MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'Redeem loyalty points' })
  @ApiBody({
    schema: {
      example: { points: 50, reference: 'Discount applied' }
    }
  })
  redeemLoyalty(@Param('id') id: string, @Body() data: any) {
    return this.service.redeemLoyaltyPoints(id, data.points, data.reference);
  }

  @Post(':id/transactions')
  @Roles('BOSS', 'MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'Add customer transaction' })
  @ApiBody({
    schema: {
      example: { type: 'CREDIT', amount: 50000, notes: 'Payment received' }
    }
  })
  addTransaction(@Param('id') id: string, @Body() data: any) {
    return this.service.addTransaction(id, data.type, data.amount, data.notes);
  }
}
