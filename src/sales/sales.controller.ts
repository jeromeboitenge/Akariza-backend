import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { Roles } from '../common/decorators';

@ApiTags('Sales')
@ApiBearerAuth()
@Controller('sales')
export class SalesController {
  constructor(private service: SalesService) {}

  @Post()
  @Roles('BOSS', 'MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'Create sale' })
  @ApiBody({
    schema: {
      example: {
        items: [
          {
            productId: 'product-id',
            quantity: 2,
            sellingPrice: 22000
          }
        ],
        paymentMethod: 'CASH',
        customerName: 'John Doe',
        customerId: 'customer-id'
      }
    }
  })
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId, req.user.id);
  }

  @Get()
  @Roles('BOSS', 'MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'Get all sales' })
  findAll(@Request() req) {
    return this.service.findAll(req.user.organizationId);
  }

  @Get('my-sales')
  @Roles('CASHIER')
  @ApiOperation({ summary: 'Get my sales' })
  findMySales(@Request() req) {
    return this.service.findMySales(req.user.organizationId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.service.findOne(id, req.user.organizationId);
  }
}
