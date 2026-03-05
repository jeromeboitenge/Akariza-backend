import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, organizationId: string, userId: string) {
    try {
      // Validate required fields
      if (!data.name || data.name.trim().length === 0) {
        throw new BadRequestException('Product name is required');
      }

      if (!data.sku || data.sku.trim().length === 0) {
        throw new BadRequestException('Product SKU is required');
      }

      if (data.costPrice === undefined || data.costPrice === null) {
        throw new BadRequestException('Cost price is required');
      }

      if (data.sellingPrice === undefined || data.sellingPrice === null) {
        throw new BadRequestException('Selling price is required');
      }

      if (data.costPrice < 0) {
        throw new BadRequestException('Cost price cannot be negative');
      }

      if (data.sellingPrice < 0) {
        throw new BadRequestException('Selling price cannot be negative');
      }

      if (data.sellingPrice < data.costPrice) {
        throw new BadRequestException('Selling price cannot be less than cost price');
      }

      // Check if SKU already exists in organization
      const existing = await this.prisma.product.findFirst({
        where: { organizationId, sku: data.sku }
      });
      
      if (existing) {
        throw new BadRequestException(`Product with SKU "${data.sku}" already exists in this organization`);
      }

      // Create product
      const product = await this.prisma.product.create({
        data: { 
          ...data, 
          organizationId, 
          createdById: userId,
          currentStock: data.currentStock || 0,
          minStockLevel: data.minStockLevel || 0,
          maxStockLevel: data.maxStockLevel || 0,
          reorderPoint: data.reorderPoint || 0,
        },
      });

      console.log('✅ Product created:', product.name, '(SKU:', product.sku, ')');
      return product;
    } catch (error) {
      // Re-throw HTTP exceptions as-is
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Handle Prisma errors
      if (error.code === 'P2002') {
        throw new BadRequestException('Product SKU already exists');
      }

      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid organization or user reference');
      }

      // Log and throw generic error
      console.error('❌ Product creation error:', error);
      throw new BadRequestException(error.message || 'Failed to create product');
    }
  }

  findAll(organizationId?: string) {
    return this.prisma.product.findMany({ 
      where: organizationId ? { organizationId, isActive: true } : { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  findByType(organizationId: string, type: string) {
    return this.prisma.product.findMany({ 
      where: organizationId ? { organizationId, isActive: true, productType: type } : { isActive: true, productType: type },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string, organizationId?: string) {
    const product = await this.prisma.product.findFirst({ 
      where: organizationId ? { id, organizationId } : { id }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, organizationId: string, data: any) {
    try {
      // Validate if product exists
      const existing = await this.prisma.product.findFirst({
        where: { id, organizationId }
      });

      if (!existing) {
        throw new NotFoundException('Product not found');
      }

      // Validate prices if provided
      if (data.costPrice !== undefined && data.costPrice < 0) {
        throw new BadRequestException('Cost price cannot be negative');
      }

      if (data.sellingPrice !== undefined && data.sellingPrice < 0) {
        throw new BadRequestException('Selling price cannot be negative');
      }

      if (data.costPrice !== undefined && data.sellingPrice !== undefined) {
        if (data.sellingPrice < data.costPrice) {
          throw new BadRequestException('Selling price cannot be less than cost price');
        }
      }

      // Check SKU uniqueness if changing SKU
      if (data.sku && data.sku !== existing.sku) {
        const skuExists = await this.prisma.product.findFirst({
          where: { 
            organizationId, 
            sku: data.sku,
            id: { not: id }
          }
        });

        if (skuExists) {
          throw new BadRequestException(`Product with SKU "${data.sku}" already exists`);
        }
      }

      const updated = await this.prisma.product.update({ 
        where: { id }, 
        data 
      });

      console.log('✅ Product updated:', updated.name);
      return updated;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      console.error('❌ Product update error:', error);
      throw new BadRequestException(error.message || 'Failed to update product');
    }
  }

  async deactivate(id: string) {
    try {
      const product = await this.prisma.product.findUnique({ where: { id } });
      
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const updated = await this.prisma.product.update({ 
        where: { id }, 
        data: { isActive: false } 
      });

      console.log('✅ Product deactivated:', updated.name);
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('❌ Product deactivation error:', error);
      throw new BadRequestException(error.message || 'Failed to deactivate product');
    }
  }

  findLowStock(organizationId: string) {
    return this.prisma.$queryRaw`
      SELECT * FROM "Product" 
      WHERE "organizationId" = ${organizationId}::uuid
      AND "isActive" = true 
      AND "currentStock" <= "minStockLevel"
      ORDER BY "currentStock" ASC
    `;
  }
}
