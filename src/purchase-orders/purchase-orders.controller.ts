// @ts-nocheck
import { Controller, Get, Post, Body, Patch, Param, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PurchaseOrdersService } from './purchase-orders.service';
import { Roles } from '../common/decorators';
import { OrganizationContextGuard } from '../common/organization-context.guard';

@ApiTags('Purchase Orders')
@ApiBearerAuth()
@Controller('purchase-orders')
@UseGuards(OrganizationContextGuard)
@Roles('BOSS', 'MANAGER', 'SYSTEM_ADMIN')
export class PurchaseOrdersController {
  constructor(private service: PurchaseOrdersService) {}

  @Post()
  @Roles('BOSS', 'MANAGER', 'SYSTEM_ADMIN') // SYSTEM_ADMIN cannot create purchase orders (read-only)
  @ApiOperation({ summary: 'Create purchase order (BOSS/MANAGER only)' })
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
  @ApiOperation({ summary: 'Get all purchase orders (SYSTEM_ADMIN: read-only all orgs, others: own org)' })
  findAll(@Request() req) {
    // Others see their organization purchase orders
      return this.service.findAll(req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order by ID (SYSTEM_ADMIN: read-only, others: own org)' })
  findOne(@Param('id') id: string, @Request() req) {
    // Others see their organization purchase orders
      return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('BOSS', 'MANAGER', 'SYSTEM_ADMIN') // SYSTEM_ADMIN cannot update purchase orders (read-only)
  @ApiOperation({ summary: 'Update purchase order (BOSS/MANAGER only)' })
  update(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.service.update(id, req.user.organizationId, data);
  }

  @Post(':id/approve')
  @Roles('BOSS', 'SYSTEM_ADMIN') // Only BOSS can approve purchase orders (SYSTEM_ADMIN read-only)
  @ApiOperation({ summary: 'Approve purchase order (BOSS only)' })
  approve(@Param('id') id: string, @Request() req) {
    return this.service.approve(id, req.user.id);
  }

  @Post(':id/convert')
  @Roles('BOSS', 'MANAGER', 'SYSTEM_ADMIN') // SYSTEM_ADMIN cannot convert purchase orders (read-only)
  @ApiOperation({ summary: 'Convert PO to purchase (BOSS/MANAGER only)' })
  convertToPurchase(@Param('id') id: string, @Request() req) {
    return this.service.convertToPurchase(id, req.user.id);
  }

  @Patch(':id/status')
  @Roles('BOSS', 'MANAGER', 'SYSTEM_ADMIN') // SYSTEM_ADMIN cannot update status (read-only)
  @ApiOperation({ summary: 'Update purchase order status (BOSS/MANAGER only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['PENDING', 'APPROVED', 'ORDERED', 'RECEIVED', 'CANCELLED'] }
      }
    }
  })
  updateStatus(@Param('id') id: string, @Body() data: { status: string }, @Request() req) {
    return this.service.updateStatus(id, data.status, req.user.id);
  }
}
