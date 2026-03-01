import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';
import { BranchesService } from '../branches/branches.service';
import { Roles } from '../common/decorators';

@ApiTags('Admin - Branches')
@ApiBearerAuth('JWT-auth')
@Controller('admin/branches')
@Roles('SYSTEM_ADMIN')
export class AdminBranchesController {
  constructor(private service: BranchesService) {}

  @Post()
  @ApiOperation({ summary: 'Create branch for any organization (System Admin)' })
  @ApiBody({
    schema: {
      example: {
        organizationId: 'org-uuid',
        name: 'Downtown Branch',
        code: 'DT-001',
        address: 'KN 5 Ave, Kigali',
        phone: '+250788111222',
        email: 'downtown@store.com',
        isMainBranch: false
      }
    }
  })
  create(@Body() data: any, @Request() req) {
    return this.service.createByAdmin(data, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all branches across all organizations' })
  findAll() {
    return this.service.findAllByAdmin();
  }

  @Get('organization/:orgId')
  @ApiOperation({ summary: 'Get all branches for a specific organization' })
  @ApiParam({ name: 'orgId', example: 'org-uuid' })
  findByOrganization(@Param('orgId') orgId: string) {
    return this.service.findByOrganization(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch by ID' })
  @ApiParam({ name: 'id', example: 'branch-uuid' })
  findOne(@Param('id') id: string) {
    return this.service.findOneByAdmin(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update branch' })
  @ApiParam({ name: 'id', example: 'branch-uuid' })
  @ApiBody({
    schema: {
      example: {
        name: 'Updated Branch Name',
        address: 'New Address',
        phone: '+250788999999'
      }
    }
  })
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate branch' })
  @ApiParam({ name: 'id', example: 'branch-uuid' })
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate branch' })
  @ApiParam({ name: 'id', example: 'branch-uuid' })
  activate(@Param('id') id: string) {
    return this.service.activate(id);
  }
}
