import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const RATE_LIMIT_CONFIG: ThrottlerModuleOptions = {
  throttlers: [
    {
      name: 'default',
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    },
    {
      name: 'strict',
      ttl: 60000, // 1 minute
      limit: 10, // 10 requests per minute (for sensitive endpoints)
    },
    {
      name: 'auth',
      ttl: 900000, // 15 minutes
      limit: 5, // 5 login attempts per 15 minutes
    },
  ],
};

// Custom rate limit configurations for specific endpoints
export const ENDPOINT_RATE_LIMITS = {
  // Authentication endpoints
  login: { ttl: 900000, limit: 5 }, // 5 attempts per 15 minutes
  forgotPassword: { ttl: 3600000, limit: 3 }, // 3 attempts per hour
  resetPassword: { ttl: 3600000, limit: 3 }, // 3 attempts per hour
  
  // Data modification endpoints
  createProduct: { ttl: 60000, limit: 20 }, // 20 products per minute
  createSale: { ttl: 60000, limit: 30 }, // 30 sales per minute
  createPurchase: { ttl: 60000, limit: 20 }, // 20 purchases per minute
  
  // Report generation endpoints
  generateReport: { ttl: 60000, limit: 10 }, // 10 reports per minute
  
  // File upload endpoints
  uploadFile: { ttl: 60000, limit: 10 }, // 10 uploads per minute
};

// IP-based rate limiting for additional security
export const IP_RATE_LIMIT = {
  ttl: 60000, // 1 minute
  limit: 200, // 200 requests per IP per minute
};
