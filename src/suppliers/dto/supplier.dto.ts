import { IsString, IsEmail, IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  name: string;

  @IsString()
  contactPerson: string;

  @IsString()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  address: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  creditLimit?: number;

  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateSupplierDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  creditLimit?: number;

  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateSupplierRatingDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}

export class UpdateSupplierBalanceDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  type: 'increase' | 'decrease';

  @IsString()
  @IsOptional()
  reason?: string;
}