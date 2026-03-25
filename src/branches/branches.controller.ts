import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { Roles, SystemAdminReadOnly } from '../common/decorators';
import { SystemAdminReadOnlyGuard } from '../common/system-admin-readonly.guard';

@ApiTags('Branches')
@ApiBearerAuth()
@Controller('branches')
@UseGuards(SystemAdminReadOnlyGuard)
@SystemAdminReadOnly()
@Roles('BOSS', 'MANAGER')
export class BranchesController {
  constructor(private service: BranchesService) {}

  @Post()
  @Roles('BOSS') // Only BOSS can create branches
  @ApiOperation({ summary: 'Create branch (BOSS only)' })
  @ApiBody({
    schema: {
      example: {
        name: 'Downtown Branch',
        code: 'DT-001',
        address: 'KN 5 Ave, Kigali',
        phone: '+250788111222',
        managerId: 'user-id'
      }
    }
  })
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all branches (SYSTEM_ADMIN: read-only all orgs, BOSS/MANAGER: own org/branch)' })
  findAll(@Request() req) {
    if (req.user.role === 'SYSTEM_ADMIN') {
      // SYSTEM_ADMIN can view all branches across all organizations (read-only)
      return this.service.findAllSystemAdmin();
    } else {
      // BOSS/MANAGER see their organization/branch branches
      return this.service.findAll(req.user.organizationId);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch by ID (SYSTEM_ADMIN: read-only, BOSS/MANAGER: own org/branch)' })
  findOne(@Param('id') id: string, @Request() req) {
    if (req.user.role === 'SYSTEM_ADMIN') {
      // SYSTEM_ADMIN can view any branch (read-only)
      return this.service.findOneSystemAdmin(id);
    } else {
      // BOSS/MANAGER see their organization branches
      return this.service.findOne(id, req.user.organizationId);
    }
  }

  @Patch(':id')
  @Roles('BOSS') // Only BOSS can update branches
  @ApiOperation({ summary: 'Update branch (BOSS only)' })
  update(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.service.updateByOwner(id, req.user.organizationId, data);
  }

  @Delete(':id')
  @Roles('BOSS') // Only BOSS can deactivate branches
  @ApiOperation({ summary: 'Deactivate branch (BOSS only)' })
  deactivate(@Param('id') id: string, @Request() req) {
    return this.service.deactivateByOwner(id, req.user.organizationId);
  }

  @Get(':id/inventory')
  @ApiOperation({ summary: 'Get branch inventory (SYSTEM_ADMIN: read-only, others: own org/branch)' })
  getInventory(@Param('id') id: string, @Request() req) {
    if (req.user.role === 'SYSTEM_ADMIN') {
      // SYSTEM_ADMIN can view any branch inventory (read-only)
      return this.service.getInventorySystemAdmin(id);
    } else {
      // Others see their organization/branch inventory
      return this.service.getInventory(id);
    }
  }

  @Post('transfer')
  @Roles('BOSS', 'MANAGER') // SYSTEM_ADMIN cannot create transfers (read-only)
  @ApiOperation({ summary: 'Create stock transfer between branches (BOSS/MANAGER only)' })
  @ApiBody({
    schema: {
      example: {
        fromBranchId: 'branch-1-id',
        toBranchId: 'branch-2-id',
        productId: 'product-id',
        quantity: 50,
        notes: 'Restocking downtown branch'
      }
    }
  })
  createTransfer(@Body() data: any, @Request() req) {
    return this.service.createTransfer(data, req.user.organizationId, req.user.id);
  }

  @Post('transfer/:id/approve')
  @Roles('BOSS') // Only BOSS can approve transfers
  @ApiOperation({ summary: 'Approve stock transfer (BOSS only)' })
  approveTransfer(@Param('id') id: string, @Request() req) {
    return this.service.approveTransfer(id, req.user.id);
  }
}
