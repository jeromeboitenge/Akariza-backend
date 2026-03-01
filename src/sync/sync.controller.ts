import { Controller, Get, Post, Body, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SyncService } from './sync.service';

@ApiTags('Sync')
@ApiBearerAuth()
@Controller('sync')
export class SyncController {
  constructor(private service: SyncService) {}

  @Post('sales')
  @ApiOperation({ summary: 'Sync sales from mobile' })
  syncSales(@Body() body: { sales: any[] }, @Request() req) {
    return this.service.syncSales(body.sales, req.user.organizationId, req.user.id);
  }

  @Post('purchases')
  @ApiOperation({ summary: 'Sync purchases from mobile' })
  syncPurchases(@Body() body: { purchases: any[] }, @Request() req) {
    return this.service.syncPurchases(body.purchases, req.user.organizationId, req.user.id);
  }

  @Get('products')
  @ApiOperation({ summary: 'Get products for mobile sync' })
  getProducts(@Query('lastSyncedAt') lastSyncedAt: string, @Request() req) {
    return this.service.getProducts(req.user.organizationId, lastSyncedAt ? parseInt(lastSyncedAt) : undefined);
  }

  @Get('suppliers')
  @ApiOperation({ summary: 'Get suppliers for mobile sync' })
  getSuppliers(@Query('lastSyncedAt') lastSyncedAt: string, @Request() req) {
    return this.service.getSuppliers(req.user.organizationId, lastSyncedAt ? parseInt(lastSyncedAt) : undefined);
  }
}
