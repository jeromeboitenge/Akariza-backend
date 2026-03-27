import { Controller, Get, Post, Body, Param, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { Roles } from '../common/decorators';
import { OrganizationContextGuard } from '../common/organization-context.guard';

@ApiTags('Purchases')
@ApiBearerAuth()
@Controller('purchases')
@UseGuards(OrganizationContextGuard)
@Roles('BOSS', 'MANAGER', 'CASHIER', 'SYSTEM_ADMIN')
export class PurchasesController {
  constructor(private service: PurchasesService) {}

  @Post()
  @Roles('BOSS', 'MANAGER', 'CASHIER', 'SYSTEM_ADMIN') // SYSTEM_ADMIN cannot create purchases (read-only)
  @ApiOperation({ summary: 'Create purchase (BOSS/MANAGER/CASHIER only)' })
  @ApiBody({ type: CreatePurchaseDto })
  async create(@Body() data: CreatePurchaseDto, @Request() req) {
    console.log('🎯 Purchase controller hit:', {
      user: req.user?.id,
      organizationId: req.user?.organizationId,
      bodyKeys: Object.keys(data || {}),
      itemsCount: data?.items?.length || 0
    });
    
    try {
      return await this.service.create(data, req.user.organizationId, req.user.id);
    } catch (error) {
      console.error('❌ Controller error:', error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchases (Requires active workspace for SYSTEM_ADMIN)' })
  findAll(@Request() req) {
    // Others see their organization purchases
      return this.service.findAll(req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase by ID (Requires active workspace for SYSTEM_ADMIN)' })
  findOne(@Param('id') id: string, @Request() req) {
    // Others see their organization purchases
      return this.service.findOne(id, req.user.organizationId);
  }
}
