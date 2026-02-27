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
  @ApiOperation({ 
    summary: 'Step 1: Login with Email & Password',
    description: `
**Login Flow:**
1. Send email and password
2. System sends OTP to your email (check spam folder)
3. Use the OTP in the verify-otp endpoint

**Request Body:**
\`\`\`json
{
  "email": "jeromeboitenge@gmail.com",
  "password": "Password12!"
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "OTP sent to your email",
  "requiresOtp": true,
  "userId": "f2707400-d110-4963-9aa3-3fe5f171c756",
  "userType": "admin"
}
\`\`\`

**Next Step:** Check your email for OTP code, then call /auth/verify-otp
    `
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { 
          type: 'string', 
          example: 'jeromeboitenge@gmail.com',
          description: 'Your email address'
        },
        password: { 
          type: 'string', 
          example: 'Password12!',
          description: 'Your password'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'OTP sent to email' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('verify-otp')
  @ApiOperation({ 
    summary: 'Step 2: Verify OTP Code',
    description: `
**After receiving OTP via email, verify it here to complete login.**

**Request Body:**
\`\`\`json
{
  "userId": "f2707400-d110-4963-9aa3-3fe5f171c756",
  "otpCode": "123456",
  "userType": "admin"
}
\`\`\`

**Where to get these values:**
- \`userId\`: From the login response
- \`otpCode\`: 6-digit code sent to your email (check spam folder)
- \`userType\`: From the login response ("admin" or "user")

**Success Response:**
\`\`\`json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "f2707400-d110-4963-9aa3-3fe5f171c756",
    "email": "jeromeboitenge@gmail.com",
    "fullName": "Jerome Boitenge",
    "role": "SYSTEM_ADMIN"
  }
}
\`\`\`

**Use the accessToken in Authorization header:** \`Bearer <accessToken>\`
    `
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId', 'otpCode'],
      properties: {
        userId: { 
          type: 'string', 
          example: 'f2707400-d110-4963-9aa3-3fe5f171c756',
          description: 'User ID from login response'
        },
        otpCode: { 
          type: 'string', 
          example: '123456',
          description: '6-digit OTP code from email'
        },
        userType: { 
          type: 'string', 
          example: 'admin',
          enum: ['admin', 'user'],
          description: 'User type from login response (default: "user")'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'OTP verified, tokens returned' })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async verifyOtp(@Body() body: { userId: string; otpCode: string; userType?: string }) {
    return this.authService.verifyOtp(body.userId, body.otpCode, body.userType || 'user');
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ 
    summary: 'Refresh Access Token',
    description: `
**When your access token expires (after 15 minutes), use this to get a new one.**

**Request Body:**
\`\`\`json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
\`\`\`

**Response:**
\`\`\`json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
\`\`\`
    `
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['refreshToken'],
      properties: {
        refreshToken: { 
          type: 'string', 
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          description: 'Refresh token from login/verify-otp response'
        }
      }
    }
  })
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
