import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PurchasesService } from './purchases.service';
import { Roles } from '../common/decorators';

@ApiTags('Purchases')
@ApiBearerAuth()
@Controller('purchases')
@Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER', 'CASHIER')
export class PurchasesController {
  constructor(private service: PurchasesService) {}

  @Post()
  @ApiOperation({ summary: 'Create purchase' })
  @ApiBody({
    schema: {
      example: {
        supplierId: 'supplier-id',
        items: [
          {
            productId: 'product-id',
            quantity: 50,
            costPrice: 18000
          }
        ],
        paymentStatus: 'PAID',
        amountPaid: 900000,
        notes: 'Monthly stock replenishment'
      }
    }
  })
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchases' })
  findAll(@Request() req) {
    return this.service.findAll(req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.service.findOne(id, req.user.organizationId);
  }
}
