import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators';
import { LoginDto, RefreshTokenDto, VerifyOtpDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @ApiOperation({ summary: 'Login - Returns access and refresh tokens' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', example: 'jeromeboitenge@gmail.com' },
        password: { type: 'string', example: 'Password12!' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Login successful, returns tokens' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['refreshToken'],
      properties: {
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Returns new tokens' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshDto.refreshToken);
  }

  @Public()
  @Post('test-otp-email')
  @ApiOperation({ summary: 'Test OTP email delivery (dev only)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email'],
      properties: {
        email: { type: 'string', example: 'jeromeboitenge@gmail.com' }
      }
    }
  })
  async testOtpEmail(@Body() body: { email: string }) {
    const startTime = Date.now();
    const result = await this.authService.testEmailService(body.email);
    const duration = Date.now() - startTime;
    return { ...result, totalTime: `${duration}ms` };
  }

  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout() {
    return { message: 'Logged out successfully' };
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset OTP' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email'],
      properties: {
        email: { type: 'string', example: 'jeromeboitenge@gmail.com' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'OTP sent to email if exists' })
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('verify-reset-otp')
  @ApiOperation({ summary: 'Verify password reset OTP' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'otpCode'],
      properties: {
        email: { type: 'string', example: 'jeromeboitenge@gmail.com' },
        otpCode: { type: 'string', example: '123456' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'OTP verified' })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  async verifyResetOtp(@Body() body: { email: string; otpCode: string }) {
    return this.authService.verifyPasswordResetOtp(body.email, body.otpCode);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with OTP' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'otpCode', 'newPassword'],
      properties: {
        email: { type: 'string', example: 'jeromeboitenge@gmail.com' },
        otpCode: { type: 'string', example: '123456' },
        newPassword: { type: 'string', example: 'NewPassword123!' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 401, description: 'Invalid OTP or weak password' })
  async resetPassword(@Body() body: { email: string; otpCode: string; newPassword: string }) {
    return this.authService.resetPassword(body.email, body.otpCode, body.newPassword);
  }
}
