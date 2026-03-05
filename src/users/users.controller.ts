import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Roles } from '../common/decorators';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Post()
  @Roles('SYSTEM_ADMIN', 'BOSS')
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
  async findAll(@Request() req) {
    console.log('👤 User making request:', { 
      id: req.user.id, 
      role: req.user.role, 
      organizationId: req.user.organizationId,
      branchId: req.user.branchId,
      type: req.user.type 
    });
    const users = await this.service.findAll(
      req.user.organizationId, 
      req.user.role,
      req.user.branchId
    );
    console.log('📊 Found users count:', users.length);
    return users;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.service.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @Roles('SYSTEM_ADMIN', 'BOSS')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.service.update(id, req.user.organizationId, data);
  }

  @Delete(':id')
  @Roles('SYSTEM_ADMIN', 'BOSS')
  @ApiOperation({ summary: 'Deactivate user' })
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
  @Roles('SYSTEM_ADMIN', 'BOSS')
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
