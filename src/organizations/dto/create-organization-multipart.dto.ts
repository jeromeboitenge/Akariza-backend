import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsOptional, MinLength, Matches, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class BossDataDto {
  @ApiProperty({ example: 'John Mugisha', description: 'Full name of the organization owner' })
  @IsString()
  @IsNotEmpty({ message: 'Boss full name is required' })
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @ApiProperty({ example: 'boss@supermart.rw', description: 'Email address for the boss account' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Boss email is required' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @ApiProperty({ example: 'SecurePassword123!', description: 'Password for the boss account' })
  @IsString()
  @IsNotEmpty({ message: 'Boss password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  })
  password: string;
}

export class CreateOrganizationMultipartDto {
  @ApiProperty({ example: 'SuperMart Retail', description: 'Organization name' })
  @IsString()
  @IsNotEmpty({ message: 'Organization name is required' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ example: 'Retail', description: 'Type of business' })
  @IsString()
  @IsNotEmpty({ message: 'Business type is required' })
  @Transform(({ value }) => value?.trim())
  businessType: string;

  @ApiProperty({ example: '123 Main Street, Kigali', description: 'Organization address' })
  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  @Transform(({ value }) => value?.trim())
  address: string;

  @ApiProperty({ example: '+250788123456', description: 'Organization phone number' })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Please provide a valid phone number' })
  @Transform(({ value }) => value?.trim())
  phone: string;

  @ApiProperty({ example: 'info@supermart.rw', description: 'Organization email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @ApiProperty({ 
    example: 'https://res.cloudinary.com/demo/image/upload/organization-logo.jpg',
    description: 'Organization logo URL (auto-generated after upload)',
    required: false
  })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiProperty({ 
    type: BossDataDto,
    description: 'Organization owner account details'
  })
  @ValidateNested()
  @Type(() => BossDataDto)
  @IsNotEmpty({ message: 'Boss account data is required' })
  bossData: BossDataDto;
}