import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from './common/decorators';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Root endpoint' })
  root() {
    return {
      message: 'Akariza Stock Management API',
      version: '1.0.0',
      docs: '/api/v1/docs',
      health: '/health',
    };
  }

  @Public()
  @Get('config-check')
  @ApiOperation({ summary: 'Check environment configuration' })
  configCheck() {
    return {
      database: !!process.env.DATABASE_URL,
      jwtSecret: !!process.env.JWT_SECRET,
      sendgridApiKey: !!process.env.SENDGRID_API_KEY,
      sendgridApiKeyLength: process.env.SENDGRID_API_KEY?.length || 0,
      sendgridFromEmail: process.env.SENDGRID_FROM_EMAIL || 'NOT SET',
      sendgridFromName: process.env.SENDGRID_FROM_NAME || 'NOT SET',
      nodeEnv: process.env.NODE_ENV || 'development',
    };
  }
}
