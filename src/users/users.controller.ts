import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Roles } from '../common/decorators';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@Roles('SYSTEM_ADMIN', 'BOSS')
export class UsersController {
  constructor(private service: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create user (BOSS only)' })
  @ApiBody({
    schema: {
      example: {
        email: 'newuser@example.com',
        password: 'password123',
        fullName: 'John Doe',
        role: 'MANAGER'
      }
    }
  })
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  findAll(@Request() req) {
    console.log('👤 User making request:', { 
      id: req.user.id, 
      role: req.user.role, 
      organizationId: req.user.organizationId,
      type: req.user.type 
    });
    return this.service.findAll(req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.service.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.service.update(id, req.user.organizationId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate user' })
  deactivate(@Param('id') id: string, @Request() req) {
    return this.service.deactivate(id, req.user.organizationId);
  }
}
