import { Module } from "@nestjs/common";
import { AttendanceService } from "./attendance.service";
import { AttendanceController } from "./attendance.controller";
import { AuditService } from "../audit/audit.service";
import { RabbitMQService } from "../rabbitmq/rabbitmq.service";
import { AttendanceAuditWebSocketGateway } from "../websocket/attendance-audit-websocket.gateway";

@Module({
  providers: [
    AttendanceService,
    AuditService,
    RabbitMQService,
    AttendanceAuditWebSocketGateway,
  ],
  controllers: [AttendanceController],
  exports: [AttendanceService],
})
export class AttendanceModule {}
