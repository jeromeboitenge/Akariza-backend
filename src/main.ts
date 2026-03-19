import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EnvironmentValidator } from './common/environment.validator';

async function bootstrap() {
  // Validate environment variables
  EnvironmentValidator.validate();
  
  const app = await NestFactory.create(AppModule);
  
  // CORS - restrict in production
  app.enableCors({
    origin: process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? false : '*'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  app.setGlobalPrefix('api/v1');
  
  // Validation with security
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    transform: true,
    forbidNonWhitelisted: true,
    disableErrorMessages: false, // Enable error messages for debugging
    exceptionFactory: (errors) => {
      console.log('🚨 Validation errors:', errors);
      return new BadRequestException(errors);
    }
  }));

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Akariza Stock Management API')
    .setDescription('Production-ready Multi-Organization Stock, Purchase, and Sales Management System')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Organizations', 'Organization management')
    .addTag('Users', 'User management')
    .addTag('Products', 'Product management')
    .addTag('Suppliers', 'Supplier management')
    .addTag('Purchases', 'Purchase transactions')
    .addTag('Sales', 'Sales transactions')
    .addTag('Stock', 'Stock management')
    .addTag('Reports', 'Reports and analytics')
    .addTag('Sync', 'Mobile sync endpoints')
    .addTag('Branches', 'Branch management')
    .addTag('Customers', 'Customer management')
    .addTag('Employees', 'Employee management')
    .addTag('Promotions', 'Promotions and discounts')
    .addTag('Purchase Orders', 'Purchase order management')
    .addTag('Expenses', 'Expense tracking')
    .addTag('Notifications', 'Notification system')
    .addTag('Tasks', 'Task management')
    .addTag('Messages', 'Internal messaging')
    .addTag('Analytics', 'Advanced analytics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document, {
    customSiteTitle: 'Akariza API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Akariza Backend running on port ${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/v1/docs`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
