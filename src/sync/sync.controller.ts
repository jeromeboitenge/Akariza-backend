import { Controller, Get, Post, Body, Query, Request } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private service: SyncService) {}

  @Post('sales')
  syncSales(@Body() body: { sales: any[] }, @Request() req) {
    return this.service.syncSales(body.sales, req.user.organizationId, req.user.id);
  }

  @Post('purchases')
  syncPurchases(@Body() body: { purchases: any[] }, @Request() req) {
    return this.service.syncPurchases(body.purchases, req.user.organizationId, req.user.id);
  }

  @Get('products')
  getProducts(@Query('lastSyncedAt') lastSyncedAt: string, @Request() req) {
    return this.service.getProducts(req.user.organizationId, lastSyncedAt ? parseInt(lastSyncedAt) : undefined);
  }

  @Get('suppliers')
  getSuppliers(@Query('lastSyncedAt') lastSyncedAt: string, @Request() req) {
    return this.service.getSuppliers(req.user.organizationId, lastSyncedAt ? parseInt(lastSyncedAt) : undefined);
  }
}
