import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CostManagementService } from './cost-management.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, CostManagementService],
  exports: [ProductsService, CostManagementService],
})
export class ProductsModule {}
