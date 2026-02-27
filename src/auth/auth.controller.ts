import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators';
import { LoginDto, RefreshTokenDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @ApiOperation({ summary: 'Login - Returns OTP requirement' })
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
  @ApiResponse({ status: 200, description: 'OTP sent to email' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP to complete login' })
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
  @ApiResponse({ status: 200, description: 'Returns access and refresh tokens' })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() body: { email: string; otpCode: string }) {
    return this.authService.verifyOtp(body.email, body.otpCode);
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

  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout() {
    return { message: 'Logged out successfully' };
  }
}
