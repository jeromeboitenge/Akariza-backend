import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators';
import { LoginDto, RefreshTokenDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @Post('login')
  @ApiOperation({ 
    summary: 'Login (Admin, Boss, Manager, Cashier)',
    description: 'Step 1: Login with email and password. Users will receive OTP via email. Admins login directly without OTP. Rate limited to 5 attempts per minute.'
  })
  @ApiResponse({ status: 200, description: 'OTP sent to email (for users) or Login successful (for admin)' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 attempts per minute
  @Post('verify-otp')
  @ApiOperation({ 
    summary: 'Verify OTP',
    description: 'Step 2: Verify OTP code sent to email to complete login. Rate limited to 3 attempts per minute.'
  })
  @ApiResponse({ status: 200, description: 'OTP verified, tokens returned' })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async verifyOtp(@Body() body: { userId: string; otpCode: string; userType?: string }) {
    return this.authService.verifyOtp(body.userId, body.otpCode, body.userType || 'user');
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
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

  @Public()
  @Post('test-email')
  @ApiOperation({ summary: 'Test email service (development only)' })
  async testEmail(@Body() body: { email: string }) {
    return this.authService.testEmailService(body.email);
  }
}
