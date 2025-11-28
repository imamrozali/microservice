import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { AuditService } from "../audit/audit.service";
import { RabbitMQService } from "../rabbitmq/rabbitmq.service";
import { AuditWebSocketGateway } from "../websocket/audit-websocket.gateway";

@Module({
  providers: [
    UsersService,
    AuditService,
    RabbitMQService,
    AuditWebSocketGateway,
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
