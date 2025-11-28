import { Module } from "@nestjs/common";
import { EmployeesService } from "./employees.service";
import { EmployeesController } from "./employees.controller";
import { AuditService } from "../audit/audit.service";
import { RabbitMQService } from "../rabbitmq/rabbitmq.service";
import { EmployeeAuditWebSocketGateway } from "../websocket/employee-audit-websocket.gateway";

@Module({
  providers: [
    EmployeesService,
    AuditService,
    RabbitMQService,
    EmployeeAuditWebSocketGateway,
  ],
  controllers: [EmployeesController],
  exports: [EmployeesService],
})
export class EmployeesModule {}
