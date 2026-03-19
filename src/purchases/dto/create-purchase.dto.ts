import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class PurchaseItemDto {
  @ApiProperty({ example: 'product-id-here' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 18000 })
  @IsNumber()
  costPrice: number;
}

export class CreatePurchaseDto {
  @ApiProperty({ 
    example: 'supplier-id-here',
    description: 'Supplier ID is optional for purchases',
    required: false
  })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiProperty({ 
    type: [PurchaseItemDto],
    description: 'Array of purchase items'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  items: PurchaseItemDto[];

  @ApiProperty({ 
    example: 'PAID',
    enum: ['PAID', 'PARTIAL', 'UNPAID'],
    default: 'UNPAID'
  })
  @IsOptional()
  @IsEnum(['PAID', 'PARTIAL', 'UNPAID'])
  paymentStatus?: string;

  @ApiProperty({ example: 900000, required: false })
  @IsOptional()
  @IsNumber()
  amountPaid?: number;

  @ApiProperty({ example: 'Monthly stock replenishment', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false, description: 'Mobile sync ID' })
  @IsOptional()
  @IsString()
  mobileRecordId?: string;
}