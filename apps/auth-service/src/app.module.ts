import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { DatabaseModule } from "@repo/database";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { AuditController } from "./audit/audit.controller";
import { AuditService } from "./audit/audit.service";
import { RabbitMQService } from "./rabbitmq/rabbitmq.service";
import { AuditWebSocketGateway } from "./websocket/audit-websocket.gateway";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule.forRoot(),
    PassportModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: process.env.JWT_SECRET || "fallback-secret-key",
        signOptions: {
          expiresIn: (process.env.JWT_EXPIRES_IN || "24h") as any,
        },
      }),
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AuditController],
  providers: [AuditService, RabbitMQService, AuditWebSocketGateway],
})
export class AppModule {}
