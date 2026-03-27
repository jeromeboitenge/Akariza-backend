import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { Roles } from '../common/decorators';
import { OrganizationContextGuard } from '../common/organization-context.guard';

@ApiTags('Suppliers')
@ApiBearerAuth()
@Controller('suppliers')
@UseGuards(OrganizationContextGuard)
export class SuppliersController {
  constructor(private service: SuppliersService) {}

  @Post()
  @Roles('BOSS', 'MANAGER', 'SYSTEM_ADMIN') // SYSTEM_ADMIN cannot create suppliers (read-only)
  @ApiOperation({ summary: 'Create supplier (BOSS/MANAGER only)' })
  @ApiBody({
    schema: {
      example: {
        name: 'ABC Distributors Ltd',
        email: 'info@abc.com',
        phone: '+250788999888',
        address: 'Kigali, Rwanda',
        contactPerson: 'Jane Smith',
        paymentTerms: 'Net 30 days'
      }
    }
  })
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId, req.user.id);
  }

  @Get()
  @Roles('BOSS', 'MANAGER', 'CASHIER', 'SYSTEM_ADMIN')
  @ApiOperation({ summary: 'Get all suppliers (Requires active workspace for SYSTEM_ADMIN)' })
  findAll(@Request() req) {
    // Others see their organization suppliers
      return this.service.findAll(req.user.organizationId);
  }

  @Get(':id')
  @Roles('BOSS', 'MANAGER', 'CASHIER', 'SYSTEM_ADMIN')
  @ApiOperation({ summary: 'Get supplier by ID (Requires active workspace for SYSTEM_ADMIN)' })
  findOne(@Param('id') id: string, @Request() req) {
    // Others see their organization suppliers
      return this.service.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @Roles('BOSS', 'MANAGER', 'SYSTEM_ADMIN') // SYSTEM_ADMIN cannot update suppliers (read-only)
  @ApiOperation({ summary: 'Update supplier (BOSS/MANAGER only)' })
  update(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.service.update(id, req.user.organizationId, data);
  }

  @Delete(':id')
  @Roles('BOSS', 'MANAGER', 'SYSTEM_ADMIN') // SYSTEM_ADMIN cannot delete suppliers (read-only)
  @ApiOperation({ summary: 'Delete supplier (BOSS/MANAGER only)' })
  delete(@Param('id') id: string, @Request() req) {
    return this.service.remove(id, req.user.organizationId);
  }
}
