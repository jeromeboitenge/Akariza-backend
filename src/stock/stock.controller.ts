import { Controller, Get, Post, Body, Query, Request } from '@nestjs/common';
import { StockService } from './stock.service';
import { Roles } from '../common/decorators';

@Controller('stock')
export class StockController {
  constructor(private service: StockService) {}

  @Get('transactions')
  getTransactions(@Query('productId') productId: string, @Request() req) {
    return this.service.getTransactions(req.user.organizationId, productId);
  }

  @Post('adjust')
  @Roles('BOSS', 'MANAGER')
  adjustStock(@Body() data: any, @Request() req) {
    return this.service.adjustStock(
      req.user.organizationId,
      data.productId,
      data.quantity,
      req.user.id,
      data.notes,
    );
  }

  @Get('valuation')
  getValuation(@Request() req) {
    return this.service.getValuation(req.user.organizationId);
  }
}
