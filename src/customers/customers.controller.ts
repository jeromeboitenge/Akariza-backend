// @ts-nocheck
import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { Roles, SystemAdminReadOnly } from '../common/decorators';
import { SystemAdminReadOnlyGuard } from '../common/system-admin-readonly.guard';

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('customers')
@UseGuards(SystemAdminReadOnlyGuard)
@SystemAdminReadOnly()
export class CustomersController {
  constructor(private service: CustomersService) {}

  @Post()
  @Roles('MANAGER') // Only MANAGER can create customers
  @ApiOperation({ summary: 'Create customer (MANAGER only)' })
  @ApiBody({
    schema: {
      example: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+250788123456',
        address: 'Kigali, Rwanda',
        loyaltyEnabled: true
      }
    }
  })
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId, req.user.branchId, req.user.id);
  }

  @Get()
  @Roles('BOSS', 'MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'Get all customers (SYSTEM_ADMIN: read-only all orgs, others: view branch customers)' })
  findAll(@Request() req) {
    if (req.user.role === 'SYSTEM_ADMIN') {
      throw new ForbiddenException('System Admin cannot access operational data.');
    } else if (req.user.role === 'BOSS') {
      // BOSS can view all customers in their organization
      return this.service.findAll(req.user.organizationId);
    } else {
      // MANAGER and CASHIER see customers from their branch only
      return this.service.findByBranch(req.user.organizationId, req.user.branchId);
    }
  }

  @Get(':id')
  @Roles('BOSS', 'MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'Get customer by ID (scoped by role)' })
  findOne(@Param('id') id: string, @Request() req) {
    if (req.user.role === 'SYSTEM_ADMIN') {
      throw new ForbiddenException('System Admin cannot access operational data.');
    } else if (req.user.role === 'BOSS') {
      // BOSS can view customers in their organization
      return this.service.findOne(id, req.user.organizationId);
    } else {
      // MANAGER and CASHIER see customers from their branch only
      return this.service.findOneByBranch(id, req.user.organizationId, req.user.branchId);
    }
  }

  @Patch(':id')
  @Roles('MANAGER') // Only MANAGER can update customers
  @ApiOperation({ summary: 'Update customer (MANAGER only)' })
  update(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.service.updateByBranch(id, req.user.organizationId, req.user.branchId, data);
  }

  @Delete(':id')
  @Roles('MANAGER') // Only MANAGER can deactivate customers
  @ApiOperation({ summary: 'Deactivate customer (MANAGER only)' })
  deactivate(@Param('id') id: string, @Request() req) {
    return this.service.deactivateByBranch(id, req.user.organizationId, req.user.branchId);
  }

  @Post(':id/loyalty/add')
  @Roles('MANAGER', 'CASHIER') // MANAGER and CASHIER can add loyalty points (SYSTEM_ADMIN read-only, BOSS view-only)
  @ApiOperation({ summary: 'Add loyalty points (MANAGER/CASHIER only)' })
  @ApiBody({
    schema: {
      example: { points: 100, reference: 'Purchase #123' }
    }
  })
  addLoyalty(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.service.addLoyaltyPointsByBranch(id, req.user.organizationId, req.user.branchId, data.points, data.reference);
  }

  @Post(':id/loyalty/redeem')
  @Roles('MANAGER', 'CASHIER') // MANAGER and CASHIER can redeem loyalty points
  @ApiOperation({ summary: 'Redeem loyalty points (MANAGER/CASHIER only)' })
  @ApiBody({
    schema: {
      example: { points: 50, reference: 'Discount applied' }
    }
  })
  redeemLoyalty(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.service.redeemLoyaltyPointsByBranch(id, req.user.organizationId, req.user.branchId, data.points, data.reference);
  }

  @Post(':id/transactions')
  @Roles('MANAGER', 'CASHIER') // MANAGER and CASHIER can add transactions
  @ApiOperation({ summary: 'Add customer transaction (MANAGER/CASHIER only)' })
  @ApiBody({
    schema: {
      example: { type: 'CREDIT', amount: 50000, notes: 'Payment received' }
    }
  })
  addTransaction(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.service.addTransactionByBranch(id, req.user.organizationId, req.user.branchId, data.type, data.amount, data.notes);
  }
}
