import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { Roles } from '../common/decorators';
import { CreateProductDto } from '../common/dto/examples.dto';

@ApiTags('Products')
@ApiBearerAuth('JWT-auth')
@Controller('products')
export class ProductsController {
  constructor(private service: ProductsService) {}

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
  create(@Body() data: CreateProductDto, @Request() req) {
    return this.service.create(data, req.user.organizationId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  findAll(@Request() req) {
    return this.service.findAll(req.user.organizationId);
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
  @Roles('BOSS', 'MANAGER')
  update(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.service.update(id, req.user.organizationId, data);
  }

  @Delete(':id')
  @Roles('BOSS', 'MANAGER')
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }
}
