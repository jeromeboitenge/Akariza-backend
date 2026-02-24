import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsOptional, IsNumber, IsEnum, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'Rice 25kg', description: 'Product name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'RICE-25', description: 'Unique product SKU' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 'Grains', description: 'Product type/category' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ 
    example: 'kg', 
    description: 'Quantity unit',
    enum: ['kg', 'g', 'piece', 'liter', 'ml', 'bag', 'box', 'carton', 'dozen']
  })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ example: 18000, description: 'Unit cost (purchase price)' })
  @IsNumber()
  @IsNotEmpty()
  costPrice: number;

  @ApiProperty({ example: 22000, description: 'Unit selling price' })
  @IsNumber()
  @IsNotEmpty()
  sellingPrice: number;

  @ApiProperty({ 
    example: '2026-12-31', 
    description: 'Expiration date (YYYY-MM-DD)',
    required: false 
  })
  @IsString()
  @IsOptional()
  expirationDate?: string;

  @ApiProperty({ example: 50, description: 'Initial stock quantity', required: false })
  @IsNumber()
  @IsOptional()
  currentStock?: number;

  @ApiProperty({ example: 10, description: 'Minimum stock level for alerts', required: false })
  @IsNumber()
  @IsOptional()
  minStockLevel?: number;

  @ApiProperty({ example: 100, description: 'Maximum stock level', required: false })
  @IsNumber()
  @IsOptional()
  maxStockLevel?: number;

  @ApiProperty({ example: 15, description: 'Reorder point', required: false })
  @IsNumber()
  @IsOptional()
  reorderPoint?: number;

  @ApiProperty({ example: true, description: 'Does product have expiry date?', required: false })
  @IsOptional()
  hasExpiry?: boolean;

  @ApiProperty({ example: false, description: 'Track by batch number?', required: false })
  @IsOptional()
  trackBatch?: boolean;

  @ApiProperty({ example: false, description: 'Track by serial number?', required: false })
  @IsOptional()
  trackSerial?: boolean;
}

export class CreateSaleDto {
  @ApiProperty({
    example: [
      { productId: 'product-id-here', quantity: 2, sellingPrice: 22000 }
    ]
  })
  @IsArray()
  items: Array<{
    productId: string;
    quantity: number;
    sellingPrice: number;
  }>;

  @ApiProperty({ example: 'CASH', enum: ['CASH', 'CARD', 'MOBILE'] })
  @IsString()
  paymentMethod: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiProperty({ example: 'customer-id-here', required: false })
  @IsString()
  @IsOptional()
  customerId?: string;
}

export class CreatePurchaseDto {
  @ApiProperty({ example: 'supplier-id-here' })
  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @ApiProperty({
    example: [
      { productId: 'product-id-here', quantity: 50, costPrice: 18000 }
    ]
  })
  @IsArray()
  items: Array<{
    productId: string;
    quantity: number;
    costPrice: number;
  }>;

  @ApiProperty({ example: 'PAID', enum: ['PAID', 'UNPAID', 'PARTIAL'], required: false })
  @IsString()
  @IsOptional()
  paymentStatus?: string;

  @ApiProperty({ example: 900000, required: false })
  @IsNumber()
  @IsOptional()
  amountPaid?: number;

  @ApiProperty({ example: 'Bulk purchase for February', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateSupplierDto {
  @ApiProperty({ example: 'ABC Wholesalers' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'David Kalisa' })
  @IsString()
  @IsNotEmpty()
  contactPerson: string;

  @ApiProperty({ example: '+250788111111' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'abc@wholesale.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'Industrial Area, Kigali' })
  @IsString()
  @IsNotEmpty()
  address: string;
}

export class CreateCustomerDto {
  @ApiProperty({ example: 'Alice Mukamana' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+250788333333' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'alice@email.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'Kimironko, Kigali', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'VIP', enum: ['REGULAR', 'VIP', 'WHOLESALE'], required: false })
  @IsString()
  @IsOptional()
  customerType?: string;
}

export class CreateUserDto {
  @ApiProperty({ example: 'user@store.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'CASHIER', enum: ['BOSS', 'MANAGER', 'CASHIER'] })
  @IsEnum(['BOSS', 'MANAGER', 'CASHIER'])
  role: string;

  @ApiProperty({ example: 'branch-id-here', required: false })
  @IsString()
  @IsOptional()
  branchId?: string;
}

class BossDataDto {
  @ApiProperty({ example: 'boss@supermart.rw' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'boss123' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'John Mugisha' })
  @IsString()
  fullName: string;
}

export class CreateOrganizationDto {
  @ApiProperty({ example: 'SuperMart Retail' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Retail' })
  @IsString()
  @IsNotEmpty()
  businessType: string;

  @ApiProperty({ example: '123 Main Street, Kigali' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: '+250788123456' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'info@supermart.rw' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    required: true,
    example: {
      email: 'boss@supermart.rw',
      password: 'boss123',
      fullName: 'John Mugisha'
    }
  })
  @ValidateNested()
  @Type(() => BossDataDto)
  @IsNotEmpty()
  bossData: BossDataDto;
}
