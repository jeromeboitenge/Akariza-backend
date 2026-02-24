import { Module } from '@nestjs/common';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { StockService } from '../stock/stock.service';

@Module({
  controllers: [PurchasesController],
  providers: [PurchasesService, StockService],
})
export class PurchasesModule {}
