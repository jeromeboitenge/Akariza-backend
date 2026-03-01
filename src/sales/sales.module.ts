import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { StockService } from '../stock/stock.service';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  controllers: [SalesController],
  providers: [SalesService, StockService, NotificationsService],
})
export class SalesModule {}
