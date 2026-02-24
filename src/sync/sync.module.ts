import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { StockService } from '../stock/stock.service';

@Module({
  controllers: [SyncController],
  providers: [SyncService, StockService],
})
export class SyncModule {}
