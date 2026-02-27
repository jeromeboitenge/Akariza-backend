export class EnvironmentValidator {
  static validate() {
    const required = [
      'DATABASE_URL',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'SENDGRID_API_KEY',
      'SENDGRID_FROM_EMAIL',
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Validate JWT secrets are strong
    if (process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters');
    }

    if (process.env.JWT_REFRESH_SECRET.length < 32) {
      throw new Error('JWT_REFRESH_SECRET must be at least 32 characters');
    }

    // Warn about production settings
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.FRONTEND_URL) {
        console.warn('⚠️  FRONTEND_URL not set - CORS will block all origins');
      }
      
      if (process.env.JWT_SECRET.includes('change-in-production')) {
        throw new Error('JWT_SECRET must be changed in production');
      }
    }

    console.log('✅ Environment variables validated');
  }
}
