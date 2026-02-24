import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { Roles } from '../common/decorators';
import { CreateOrganizationDto } from '../common/dto/examples.dto';

@ApiTags('Organizations')
@ApiBearerAuth('JWT-auth')
@Controller('organizations')
@Roles('SYSTEM_ADMIN')
export class OrganizationsController {
  constructor(private service: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new organization' })
  @ApiBody({ type: CreateOrganizationDto })
  @ApiResponse({ status: 201, description: 'Organization created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 409, description: 'Organization already exists (duplicate name, email, or phone)' })
  create(@Body() data: CreateOrganizationDto, @Request() req) {
    return this.service.create(data, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all organizations' })
  @ApiResponse({ status: 200, description: 'List of all organizations' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiParam({ name: 'id', example: 'org-1' })
  @ApiResponse({ status: 200, description: 'Organization details' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update organization' })
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
  @ApiResponse({ status: 404, description: 'Organization not found' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate organization' })
  @ApiParam({ name: 'id', example: 'org-1' })
  @ApiResponse({ status: 200, description: 'Organization deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate organization' })
  @ApiParam({ name: 'id', example: 'org-1' })
  @ApiResponse({ status: 200, description: 'Organization activated successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  activate(@Param('id') id: string) {
    return this.service.activate(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get organization statistics' })
  @ApiParam({ name: 'id', example: 'org-1' })
  @ApiResponse({ status: 200, description: 'Organization statistics' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  getStats(@Param('id') id: string) {
    return this.service.getStats(id);
  }
}
