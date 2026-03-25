import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { Roles, SystemAdminReadOnly } from '../common/decorators';
import { SystemAdminReadOnlyGuard } from '../common/system-admin-readonly.guard';

@ApiTags('Purchases')
@ApiBearerAuth()
@Controller('purchases')
@UseGuards(SystemAdminReadOnlyGuard)
@SystemAdminReadOnly()
@Roles('BOSS', 'MANAGER', 'CASHIER')
export class PurchasesController {
  constructor(private service: PurchasesService) {}

  @Post()
  @Roles('BOSS', 'MANAGER', 'CASHIER') // SYSTEM_ADMIN cannot create purchases (read-only)
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
  @ApiOperation({ summary: 'Get all purchases (SYSTEM_ADMIN: read-only all orgs, others: own org)' })
  findAll(@Request() req) {
    if (req.user.role === 'SYSTEM_ADMIN') {
      // SYSTEM_ADMIN can view all purchases across all organizations (read-only)
      return this.service.findAllSystemAdmin();
    } else {
      // Others see their organization purchases
      return this.service.findAll(req.user.organizationId);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase by ID (SYSTEM_ADMIN: read-only, others: own org)' })
  findOne(@Param('id') id: string, @Request() req) {
    if (req.user.role === 'SYSTEM_ADMIN') {
      // SYSTEM_ADMIN can view any purchase (read-only)
      return this.service.findOneSystemAdmin(id);
    } else {
      // Others see their organization purchases
      return this.service.findOne(id, req.user.organizationId);
    }
  }
}
