// @ts-nocheck
import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CostManagementService } from './cost-management.service';
import { Roles, SystemAdminReadOnly } from '../common/decorators';
import { SystemAdminReadOnlyGuard } from '../common/system-admin-readonly.guard';
import { CreateProductDto } from '../common/dto/examples.dto';

@ApiTags('Products')
@ApiBearerAuth('JWT-auth')
@Controller('products')
@UseGuards(SystemAdminReadOnlyGuard)
@SystemAdminReadOnly()
@Roles('BOSS', 'MANAGER', 'CASHIER')
export class ProductsController {
  constructor(
    private service: ProductsService,
    private costManagementService: CostManagementService,
  ) {}

  @Post()
  @Roles('BOSS', 'MANAGER') // SYSTEM_ADMIN cannot create products (read-only)
  @ApiOperation({ summary: 'Create new product (BOSS/MANAGER only)' })
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
  @ApiOperation({ summary: 'Get all products (SYSTEM_ADMIN: read-only all orgs, others: own org)' })
  findAll(@Request() req) {
    if (req.user.role === 'SYSTEM_ADMIN') {
      // SYSTEM_ADMIN can view all products across all organizations (read-only)
      return (this.service as any).findAllSystemAdmin();
    } else {
      // Others see their organization products
      return this.service.findAll(req.user.organizationId);
    }
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get products by type (REGULAR or FAST_MOVING)' })
  findByType(@Param('type') type: string, @Request() req) {
    if (req.user.role === 'SYSTEM_ADMIN') {
      // SYSTEM_ADMIN can view all products by type (read-only)
      return (this.service as any).findByTypeSystemAdmin(type);
    } else {
      // Others see their organization products by type
      return this.service.findByType(req.user.organizationId, type);
    }
  }

  @Get('low-stock')
  findLowStock(@Request() req) {
    if (req.user.role === 'SYSTEM_ADMIN') {
      // SYSTEM_ADMIN can view all low stock products (read-only)
      return (this.service as any).findLowStockSystemAdmin();
    } else {
      // Others see their organization low stock products
      return this.service.findLowStock(req.user.organizationId);
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    if (req.user.role === 'SYSTEM_ADMIN') {
      // SYSTEM_ADMIN can view any product (read-only)
      return (this.service as any).findOneSystemAdmin(id);
    } else {
      // Others see their organization products
      return this.service.findOne(id, req.user.organizationId);
    }
  }

  @Patch(':id')
  @Roles('BOSS', 'MANAGER') // SYSTEM_ADMIN cannot update products (read-only)
  @ApiOperation({ summary: 'Update product (BOSS/MANAGER only)' })
  update(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.service.update(id, req.user.organizationId, data);
  }

  @Get(':id/cost-history')
  @ApiOperation({ summary: 'Get product cost change history' })
  getCostHistory(@Param('id') id: string, @Request() req) {
    if (req.user.role === 'SYSTEM_ADMIN') {
      // SYSTEM_ADMIN can view any product cost history (read-only)
      return (this.costManagementService as any).getProductCostHistorySystemAdmin(id);
    } else {
      // Others see their organization product cost history
      return this.costManagementService.getProductCostHistory(req.user.organizationId, id);
    }
  }

  @Get(':id/cost-statistics')
  @ApiOperation({ summary: 'Get product cost statistics and analysis' })
  getCostStatistics(@Param('id') id: string, @Request() req) {
    if (req.user.role === 'SYSTEM_ADMIN') {
      // SYSTEM_ADMIN can view any product cost statistics (read-only)
      return (this.costManagementService as any).getProductCostStatisticsSystemAdmin(id);
    } else {
      // Others see their organization product cost statistics
      return this.costManagementService.getProductCostStatistics(req.user.organizationId, id);
    }
  }

  @Post(':id/adjust-stock')
  @Roles('BOSS', 'MANAGER') // SYSTEM_ADMIN cannot adjust stock (read-only)
  @ApiOperation({ summary: 'Adjust product stock (BOSS/MANAGER only)' })
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
  @Roles('BOSS', 'MANAGER') // SYSTEM_ADMIN cannot deactivate products (read-only)
  @ApiOperation({ summary: 'Deactivate product (BOSS/MANAGER only)' })
  deactivate(@Param('id') id: string, @Request() req) {
    return this.service.remove(id, req.user.organizationId);
  }
}
