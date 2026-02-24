import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Rice 25kg' })
  name: string;

  @ApiProperty({ example: 'RICE-25' })
  sku: string;

  @ApiProperty({ example: 'Grains', required: false })
  category?: string;

  @ApiProperty({ example: 'bag', required: false })
  unit?: string;

  @ApiProperty({ example: 18000 })
  costPrice: number;

  @ApiProperty({ example: 22000 })
  sellingPrice: number;

  @ApiProperty({ example: 50, required: false })
  currentStock?: number;

  @ApiProperty({ example: 10, required: false })
  minStockLevel?: number;

  @ApiProperty({ example: 100, required: false })
  maxStockLevel?: number;

  @ApiProperty({ example: 15, required: false })
  reorderPoint?: number;
}

export class CreateSaleDto {
  @ApiProperty({
    example: [
      { productId: 'product-id-here', quantity: 2, sellingPrice: 22000 }
    ]
  })
  items: Array<{
    productId: string;
    quantity: number;
    sellingPrice: number;
  }>;

  @ApiProperty({ example: 'CASH', enum: ['CASH', 'CARD', 'MOBILE'] })
  paymentMethod: string;

  @ApiProperty({ example: 'John Doe', required: false })
  customerName?: string;

  @ApiProperty({ example: 'customer-id-here', required: false })
  customerId?: string;
}

export class CreatePurchaseDto {
  @ApiProperty({ example: 'supplier-id-here' })
  supplierId: string;

  @ApiProperty({
    example: [
      { productId: 'product-id-here', quantity: 50, costPrice: 18000 }
    ]
  })
  items: Array<{
    productId: string;
    quantity: number;
    costPrice: number;
  }>;

  @ApiProperty({ example: 'PAID', enum: ['PAID', 'UNPAID', 'PARTIAL'], required: false })
  paymentStatus?: string;

  @ApiProperty({ example: 900000, required: false })
  amountPaid?: number;

  @ApiProperty({ example: 'Bulk purchase for February', required: false })
  notes?: string;
}

export class CreateSupplierDto {
  @ApiProperty({ example: 'ABC Wholesalers' })
  name: string;

  @ApiProperty({ example: 'David Kalisa' })
  contactPerson: string;

  @ApiProperty({ example: '+250788111111' })
  phone: string;

  @ApiProperty({ example: 'abc@wholesale.com', required: false })
  email?: string;

  @ApiProperty({ example: 'Industrial Area, Kigali' })
  address: string;
}

export class CreateCustomerDto {
  @ApiProperty({ example: 'Alice Mukamana' })
  name: string;

  @ApiProperty({ example: '+250788333333' })
  phone: string;

  @ApiProperty({ example: 'alice@email.com', required: false })
  email?: string;

  @ApiProperty({ example: 'Kimironko, Kigali', required: false })
  address?: string;

  @ApiProperty({ example: 'VIP', enum: ['REGULAR', 'VIP', 'WHOLESALE'], required: false })
  customerType?: string;
}

export class CreateUserDto {
  @ApiProperty({ example: 'user@store.com' })
  email: string;

  @ApiProperty({ example: 'password123' })
  password: string;

  @ApiProperty({ example: 'John Doe' })
  fullName: string;

  @ApiProperty({ example: 'CASHIER', enum: ['BOSS', 'MANAGER', 'CASHIER'] })
  role: string;

  @ApiProperty({ example: 'branch-id-here', required: false })
  branchId?: string;
}

export class CreateOrganizationDto {
  @ApiProperty({ example: 'SuperMart Retail' })
  name: string;

  @ApiProperty({ example: 'Retail' })
  businessType: string;

  @ApiProperty({ example: '123 Main Street, Kigali' })
  address: string;

  @ApiProperty({ example: '+250788123456' })
  phone: string;

  @ApiProperty({ example: 'info@supermart.rw' })
  email: string;
}
