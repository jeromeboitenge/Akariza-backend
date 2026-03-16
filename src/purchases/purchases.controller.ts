import { Controller, Get, Post, Body, Param, Request, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { Roles } from '../common/decorators';

@ApiTags('Purchases')
@ApiBearerAuth()
@Controller('purchases')
@Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER', 'CASHIER')
export class PurchasesController {
  constructor(private service: PurchasesService) {}

  @Post()
  @ApiOperation({ summary: 'Create purchase' })
  @ApiBody({ type: CreatePurchaseDto })
  create(@Body(ValidationPipe) data: CreatePurchaseDto, @Request() req) {
    return this.service.create(data, req.user.organizationId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchases' })
  findAll(@Request() req) {
    return this.service.findAll(req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.service.findOne(id, req.user.organizationId);
  }
}
