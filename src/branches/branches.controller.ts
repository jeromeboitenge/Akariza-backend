import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { Roles } from '../common/decorators';

@ApiTags('Branches')
@ApiBearerAuth()
@Controller('branches')
@Roles('BOSS', 'MANAGER')
export class BranchesController {
  constructor(private service: BranchesService) {}

  @Post()
  @Roles('BOSS')
  @ApiOperation({ summary: 'Create branch' })
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
  @ApiOperation({ summary: 'Get all branches' })
  findAll(@Request() req) {
    return this.service.findAll(req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.service.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @Roles('BOSS')
  @ApiOperation({ summary: 'Update branch' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @Roles('BOSS')
  @ApiOperation({ summary: 'Deactivate branch' })
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }

  @Get(':id/inventory')
  @ApiOperation({ summary: 'Get branch inventory' })
  getInventory(@Param('id') id: string) {
    return this.service.getInventory(id);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Create stock transfer between branches' })
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
  @Roles('BOSS')
  @ApiOperation({ summary: 'Approve stock transfer' })
  approveTransfer(@Param('id') id: string, @Request() req) {
    return this.service.approveTransfer(id, req.user.id);
  }
}
