import { Controller, Get, Post, Body, Patch, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PurchaseOrdersService } from './purchase-orders.service';
import { Roles, SystemAdminReadOnly } from '../common/decorators';
import { SystemAdminReadOnlyGuard } from '../common/system-admin-readonly.guard';

@ApiTags('Purchase Orders')
@ApiBearerAuth()
@Controller('purchase-orders')
@UseGuards(SystemAdminReadOnlyGuard)
@SystemAdminReadOnly()
@Roles('BOSS', 'MANAGER')
export class PurchaseOrdersController {
  constructor(private service: PurchaseOrdersService) {}

  @Post()
  @Roles('BOSS', 'MANAGER') // SYSTEM_ADMIN cannot create purchase orders (read-only)
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
    if (req.user.role === 'SYSTEM_ADMIN') {
      // SYSTEM_ADMIN can view all purchase orders across all organizations (read-only)
      return this.service.findAllSystemAdmin();
    } else {
      // Others see their organization purchase orders
      return this.service.findAll(req.user.organizationId);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order by ID (SYSTEM_ADMIN: read-only, others: own org)' })
  findOne(@Param('id') id: string, @Request() req) {
    if (req.user.role === 'SYSTEM_ADMIN') {
      // SYSTEM_ADMIN can view any purchase order (read-only)
      return this.service.findOneSystemAdmin(id);
    } else {
      // Others see their organization purchase orders
      return this.service.findOne(id);
    }
  }

  @Patch(':id')
  @Roles('BOSS', 'MANAGER') // SYSTEM_ADMIN cannot update purchase orders (read-only)
  @ApiOperation({ summary: 'Update purchase order (BOSS/MANAGER only)' })
  update(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.service.updateByOwner(id, req.user.organizationId, data);
  }

  @Post(':id/approve')
  @Roles('BOSS') // Only BOSS can approve purchase orders (SYSTEM_ADMIN read-only)
  @ApiOperation({ summary: 'Approve purchase order (BOSS only)' })
  approve(@Param('id') id: string, @Request() req) {
    return this.service.approve(id, req.user.id);
  }

  @Post(':id/convert')
  @Roles('BOSS', 'MANAGER') // SYSTEM_ADMIN cannot convert purchase orders (read-only)
  @ApiOperation({ summary: 'Convert PO to purchase (BOSS/MANAGER only)' })
  convertToPurchase(@Param('id') id: string, @Request() req) {
    return this.service.convertToPurchase(id, req.user.id);
  }

  @Patch(':id/status')
  @Roles('BOSS', 'MANAGER') // SYSTEM_ADMIN cannot update status (read-only)
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
