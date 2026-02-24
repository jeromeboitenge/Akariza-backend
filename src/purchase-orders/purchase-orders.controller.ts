import { Controller, Get, Post, Body, Patch, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PurchaseOrdersService } from './purchase-orders.service';
import { Roles } from '../common/decorators';

@ApiTags('Purchase Orders')
@ApiBearerAuth()
@Controller('purchase-orders')
@Roles('BOSS', 'MANAGER')
export class PurchaseOrdersController {
  constructor(private service: PurchaseOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create purchase order' })
  @ApiBody({
    schema: {
      example: {
        supplierId: 'supplier-id',
        expectedDate: '2026-03-01',
        items: [
          {
            productId: 'product-id',
            quantity: 100,
            unitPrice: 18000
          }
        ],
        notes: 'Urgent order for restocking'
      }
    }
  })
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchase orders' })
  findAll(@Request() req) {
    return this.service.findAll(req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update purchase order' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Post(':id/approve')
  @Roles('BOSS')
  @ApiOperation({ summary: 'Approve purchase order' })
  approve(@Param('id') id: string, @Request() req) {
    return this.service.approve(id, req.user.id);
  }

  @Post(':id/convert')
  @ApiOperation({ summary: 'Convert PO to purchase' })
  convertToPurchase(@Param('id') id: string, @Request() req) {
    return this.service.convertToPurchase(id, req.user.id);
  }
}
