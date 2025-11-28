import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersModule } from "../users/users.module";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";
import { AuditService } from "../audit/audit.service";
import { RabbitMQService } from "../rabbitmq/rabbitmq.service";
import { AuditWebSocketGateway } from "../websocket/audit-websocket.gateway";

@Module({
  imports: [UsersModule],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    AuditService,
    RabbitMQService,
    AuditWebSocketGateway,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
