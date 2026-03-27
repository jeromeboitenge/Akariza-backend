import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AdvancedAnalyticsService } from './advanced-analytics.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AdvancedAnalyticsService],
})
export class AnalyticsModule {}
