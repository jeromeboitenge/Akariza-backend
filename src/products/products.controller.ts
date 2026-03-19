import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CostManagementService } from './cost-management.service';
import { Roles } from '../common/decorators';
import { CreateProductDto } from '../common/dto/examples.dto';

@ApiTags('Products')
@ApiBearerAuth('JWT-auth')
@Controller('products')
@Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER', 'CASHIER')
export class ProductsController {
  constructor(
    private service: ProductsService,
    private costManagementService: CostManagementService,
  ) {}

  @Post()
  @Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER')
  @ApiOperation({ summary: 'Create new product' })
  @ApiBody({ 
    type: CreateProductDto,
    examples: {
      'With Expiry': {
        value: {
          name: 'Fresh Milk 1L',
          sku: 'MILK-1L',
          category: 'Dairy',
          unit: 'liter',
          costPrice: 800,
          sellingPrice: 1000,
          expirationDate: '2026-03-15',
          currentStock: 50,
          minStockLevel: 10,
          hasExpiry: true
        }
      },
      'Without Expiry': {
        value: {
          name: 'Rice 25kg',
          sku: 'RICE-25',
          category: 'Grains',
          unit: 'bag',
          costPrice: 18000,
          sellingPrice: 22000,
          currentStock: 100,
          minStockLevel: 20,
          hasExpiry: false
        }
      }
    }
  })
  async create(@Body() data: CreateProductDto, @Request() req) {
    try {
      return await this.service.create(data, req.user.organizationId, req.user.id);
    } catch (error) {
      console.error('❌ Product creation failed:', error.message);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  findAll(@Request() req) {
    return this.service.findAll(req.user.organizationId);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get products by type (REGULAR or FAST_MOVING)' })
  findByType(@Param('type') type: string, @Request() req) {
    return this.service.findByType(req.user.organizationId, type);
  }

  @Get('low-stock')
  findLowStock(@Request() req) {
    return this.service.findLowStock(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.service.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER')
  update(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.service.update(id, req.user.organizationId, data);
  }

  @Get(':id/cost-history')
  @ApiOperation({ summary: 'Get product cost change history' })
  getCostHistory(@Param('id') id: string, @Request() req) {
    return this.costManagementService.getProductCostHistory(req.user.organizationId, id);
  }

  @Get(':id/cost-statistics')
  @ApiOperation({ summary: 'Get product cost statistics and analysis' })
  getCostStatistics(@Param('id') id: string, @Request() req) {
    return this.costManagementService.getProductCostStatistics(req.user.organizationId, id);
  }

  @Post(':id/adjust-stock')
  @Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER')
  @ApiOperation({ summary: 'Adjust product stock' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        adjustmentType: { type: 'string', enum: ['increase', 'decrease', 'set'] },
        quantity: { type: 'number' },
        newStock: { type: 'number' },
        reason: { type: 'string' }
      }
    }
  })
  adjustStock(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.service.adjustStock(id, req.user.organizationId, req.user.id, data);
  }

  @Delete(':id')
  @Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER')
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }
}
