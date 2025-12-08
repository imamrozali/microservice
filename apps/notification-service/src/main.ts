import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api');

  const port = process.env.PORT || process.env.NOTIFICATION_SERVICE_PORT || 3004;
  await app.listen(port);

  console.log(`🚀 Notification Service is running on: http://localhost:${port}`);
  console.log(`📚 API endpoints: http://localhost:${port}/api/notifications`);
  console.log(`🔌 WebSocket server ready for real-time notifications`);
}

bootstrap();
