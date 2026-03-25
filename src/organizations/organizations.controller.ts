import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { Roles } from '../common/decorators';
import { CreateOrganizationDto } from '../common/dto/examples.dto';

@ApiTags('Organizations')
@ApiBearerAuth('JWT-auth')
@Controller('organizations')
@Roles('SYSTEM_ADMIN', 'BOSS')
export class OrganizationsController {
  constructor(private service: OrganizationsService) {}

  @Post()
  @Roles('SYSTEM_ADMIN', 'BOSS') // SYSTEM_ADMIN and BOSS can create organizations
  @ApiOperation({ summary: 'Create new organization (SYSTEM_ADMIN and BOSS)' })
  @ApiBody({ type: CreateOrganizationDto })
  @ApiResponse({ status: 201, description: 'Organization created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Organization already exists (duplicate name, email, or phone)' })
  create(@Body() data: CreateOrganizationDto, @Request() req) {
    return this.service.create(data, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all organizations (SYSTEM_ADMIN: read-only, BOSS: own org only)' })
  @ApiResponse({ status: 200, description: 'List of organizations' })
  findAll(@Request() req) {
    // SYSTEM_ADMIN can view all organizations (read-only)
    // BOSS can only view their own organization
    if (req.user.role === 'SYSTEM_ADMIN') {
      return this.service.findAll();
    } else {
      return this.service.findByOwner(req.user.organizationId);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID (SYSTEM_ADMIN: read-only, BOSS: own org only)' })
  @ApiParam({ name: 'id', example: 'org-1' })
  @ApiResponse({ status: 200, description: 'Organization details' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  findOne(@Param('id') id: string, @Request() req) {
    // SYSTEM_ADMIN can view any organization (read-only)
    // BOSS can only view their own organization
    if (req.user.role === 'SYSTEM_ADMIN') {
      return this.service.findOne(id);
    } else {
      return this.service.findOneByOwner(id, req.user.organizationId);
    }
  }

  @Patch(':id')
  @Roles('SYSTEM_ADMIN', 'BOSS') // SYSTEM_ADMIN and BOSS can update organizations
  @ApiOperation({ summary: 'Update organization (SYSTEM_ADMIN: any, BOSS: own organization)' })
  @ApiParam({ name: 'id', example: 'org-1' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Updated Store Name' },
        businessType: { type: 'string', example: 'Retail' },
        address: { type: 'string', example: '456 New Street, Kigali' },
        phone: { type: 'string', example: '+250788999999' },
        email: { type: 'string', example: 'updated@store.com' },
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Organization updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only update own organization' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  update(@Param('id') id: string, @Body() data: any, @Request() req) {
    if (req.user.role === 'SYSTEM_ADMIN') {
      return this.service.update(id, data);
    }
    // BOSS can only update their own organization
    return this.service.updateByOwner(id, req.user.organizationId, data);
  }

  @Delete(':id')
  @Roles('SYSTEM_ADMIN', 'BOSS') // SYSTEM_ADMIN and BOSS can deactivate organizations
  @ApiOperation({ summary: 'Deactivate organization (SYSTEM_ADMIN: any, BOSS: own organization)' })
  @ApiParam({ name: 'id', example: 'org-1' })
  @ApiResponse({ status: 200, description: 'Organization deactivated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only deactivate own organization' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  deactivate(@Param('id') id: string, @Request() req) {
    if (req.user.role === 'SYSTEM_ADMIN') {
      return this.service.deactivate(id);
    }
    // BOSS can only deactivate their own organization
    return this.service.deactivateByOwner(id, req.user.organizationId);
  }

  @Patch(':id/activate')
  @Roles('SYSTEM_ADMIN', 'BOSS') // SYSTEM_ADMIN and BOSS can activate organizations
  @ApiOperation({ summary: 'Activate organization (SYSTEM_ADMIN: any, BOSS: own organization)' })
  @ApiParam({ name: 'id', example: 'org-1' })
  @ApiResponse({ status: 200, description: 'Organization activated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only activate own organization' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  activate(@Param('id') id: string, @Request() req) {
    if (req.user.role === 'SYSTEM_ADMIN') {
      return this.service.activate(id);
    }
    // BOSS can only activate their own organization
    return this.service.activateByOwner(id, req.user.organizationId);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get organization statistics (SYSTEM_ADMIN: read-only, BOSS: own org only)' })
  @ApiParam({ name: 'id', example: 'org-1' })
  @ApiResponse({ status: 200, description: 'Organization statistics' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  getStats(@Param('id') id: string, @Request() req) {
    // SYSTEM_ADMIN can view any organization stats (read-only)
    // BOSS can only view their own organization stats
    if (req.user.role === 'SYSTEM_ADMIN') {
      return this.service.getStats(id);
    } else {
      return this.service.getStatsByOwner(id, req.user.organizationId);
    }
  }
}
