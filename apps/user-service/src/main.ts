import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Set timezone to Asia/Jakarta (WIB)
process.env.TZ = process.env.TZ || 'Asia/Jakarta';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Set global prefix
  app.setGlobalPrefix('api');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('User Service API')
    .setDescription(`
      ## User Management Service
      
      Service untuk mengelola users dan roles dalam sistem.
      
      ### Features:
      - User CRUD operations
      - Role management
      - User verification for authentication
      
      ### Internal Use:
      Service ini digunakan oleh Auth Service untuk verifikasi user.
    `)
    .setVersion('1.0.0')
    .setContact(
      'API Support',
      'https://github.com/imamrozali/mir-microservice',
      'support@dexa.com'
    )
    .addServer('http://localhost:3002', 'Local Development')
    .addServer('https://api-dev.dexa.com', 'Development')
    .addTag('users', 'User management endpoints')
    .addTag('roles', 'Role management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3002;
  await app.listen(port);

  console.log(`🚀 User Service is running on: http://localhost:${port}`);
  console.log(`📚 API endpoints: http://localhost:${port}/api`);
  console.log(`📖 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
