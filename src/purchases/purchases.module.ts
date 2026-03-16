import { Module } from '@nestjs/common';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { StockService } from '../stock/stock.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  controllers: [PurchasesController],
  providers: [PurchasesService, StockService],
})
export class PurchasesModule {}
