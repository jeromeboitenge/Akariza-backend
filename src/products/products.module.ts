import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CostManagementService } from './cost-management.service';
import { AuditLoggerService } from '../common/audit-logger.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, CostManagementService, AuditLoggerService],
  exports: [ProductsService, CostManagementService],
})
export class ProductsModule {}
