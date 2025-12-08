import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Set timezone to Asia/Jakarta (WIB)
process.env.TZ = process.env.TZ || 'Asia/Jakarta';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3003;
  await app.listen(port);

  console.log(`🚀 Attendance Service is running on: http://localhost:${port}`);
  console.log(`📚 API endpoints: http://localhost:${port}/api/docs`);
}

bootstrap();
