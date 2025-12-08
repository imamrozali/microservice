import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { WebSocketModule } from './websocket/websocket.module';
import { MinioModule } from './minio/minio.module';

@Module({
  imports: [UsersModule, RolesModule, WebSocketModule, MinioModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
