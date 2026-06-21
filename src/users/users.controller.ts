import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Roles } from '../common/decorators';
import { OrganizationContextGuard } from '../common/organization-context.guard';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(OrganizationContextGuard)
export class UsersController {
  constructor(private service: UsersService) {}

  // ── Role Management ────────────────────────────────────────────────────────

  @Get('roles/available')
  @Roles('BOSS', 'SYSTEM_ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Get available roles and permission matrix' })
  getAvailableRoles() {
    return this.service.getAvailableRoles();
  }

  @Patch(':id/role')
  @Roles('BOSS', 'SYSTEM_ADMIN')
  @ApiOperation({ summary: 'Assign a role to a user (BOSS: up to MANAGER; SYSTEM_ADMIN: any)' })
  @ApiBody({ schema: { example: { role: 'MANAGER' } } })
  assignRole(@Param('id') id: string, @Body() data: { role: string }, @Request() req) {
    return this.service.assignRole(id, data.role, req.user.role, req.user.organizationId);
  }

  @Patch(':id/status')
  @Roles('BOSS', 'SYSTEM_ADMIN')
  @ApiOperation({ summary: 'Activate or deactivate a user' })
  @ApiBody({ schema: { example: { isActive: false } } })
  setStatus(@Param('id') id: string, @Body() data: { isActive: boolean }, @Request() req) {
    return this.service.setStatus(id, data.isActive, req.user.role, req.user.organizationId);
  }

  // ── Standard CRUD ──────────────────────────────────────────────────────────

  @Post()
  @Roles('BOSS', 'MANAGER', 'SYSTEM_ADMIN') // SYSTEM_ADMIN cannot create users (read-only)
  @ApiOperation({ summary: 'Create user (BOSS and MANAGER only)' })
  @ApiBody({
    schema: {
      example: {
        email: 'newuser@example.com',
        password: 'password123',
        fullName: 'John Doe',
        role: 'CASHIER'
      }
    }
  })
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users (Requires active workspace for SYSTEM_ADMIN)' })
  async findAll(@Request() req) {
    console.log('👤 User making request:', { 
      id: req.user.id, 
      role: req.user.role, 
      organizationId: req.user.organizationId,
      branchId: req.user.branchId,
      type: req.user.type 
    });
    
    // Others see their organization/branch users
      const users = await this.service.findAll(
        req.user.organizationId, 
        req.user.role,
        req.user.branchId
      );
      console.log('📊 Found users count:', users.length);
      return users;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (Requires active workspace for SYSTEM_ADMIN)' })
  findOne(@Param('id') id: string, @Request() req) {
    // Others see their organization users
      return this.service.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @Roles('BOSS', 'SYSTEM_ADMIN') // Only BOSS can update users (Requires active workspace for SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Update user (BOSS only)' })
  update(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.service.update(id, req.user.organizationId, data);
  }

  @Delete(':id')
  @Roles('BOSS', 'SYSTEM_ADMIN') // Only BOSS can deactivate users (Requires active workspace for SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Deactivate user (BOSS only)' })
  deactivate(@Param('id') id: string, @Request() req) {
    return this.service.deactivate(id, req.user.organizationId);
  }

  @Post('request-password-change-otp')
  @ApiOperation({ summary: 'Request OTP for password change' })
  @ApiResponse({ status: 200, description: 'OTP sent to email' })
  requestPasswordChangeOtp(@Request() req) {
    return this.service.requestPasswordChangeOtp(req.user.id);
  }

  @Patch('change-password')
  @ApiOperation({ summary: 'Change own password with OTP verification' })
  @ApiBody({
    schema: {
      example: {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
        otpCode: '123456'
      }
    }
  })
  changePassword(@Body() data: any, @Request() req) {
    return this.service.changePassword(req.user.id, data.currentPassword, data.newPassword, data.otpCode);
  }

  @Patch(':id/reset-password')
  @Roles('BOSS', 'SYSTEM_ADMIN') // Only BOSS can reset passwords (Requires active workspace for SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Reset user password (BOSS only)' })
  @ApiBody({
    schema: {
      example: {
        newPassword: 'tempPassword123'
      }
    }
  })
  resetPassword(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.service.resetPassword(id, req.user.organizationId, data.newPassword);
  }
}
