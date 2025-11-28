import { Injectable, Inject } from "@nestjs/common";
import { Kysely } from "kysely";
import { DatabaseLogs, DATABASE_LOGS_TOKEN } from "@repo/database";
import { RabbitMQService } from "../rabbitmq/rabbitmq.service";
import { EmployeeAuditWebSocketGateway } from "../websocket/employee-audit-websocket.gateway";

export interface AuditLogData {
  app: string;
  service_name: string;
  event_type: "INSERT" | "UPDATE" | "DELETE";
  payload: Record<string, any>;
  target_user_id?: string | null;
}

@Injectable()
export class AuditService {
  constructor(
    @Inject(DATABASE_LOGS_TOKEN)
    private readonly logsDb: Kysely<DatabaseLogs>,
    private readonly rabbitMQService: RabbitMQService,
    private readonly employeeAuditWebSocketGateway: EmployeeAuditWebSocketGateway
  ) {}

  async createAuditLog(data: AuditLogData): Promise<void> {
    try {
      // Save to database
      const result = await this.logsDb
        .insertInto("audit_logs")
        .values({
          app: data.app,
          service_name: data.service_name,
          event_type: data.event_type,
          payload: data.payload,
          target_user_id: data.target_user_id || null,
        })
        .returning(["id", "created_at"])
        .executeTakeFirst();

      // Publish to RabbitMQ and emit Socket.IO event
      if (result) {
        const messageData = {
          ...data,
          audit_log_id: result.id,
          created_at: result.created_at,
        };

        // Publish to RabbitMQ
        await this.rabbitMQService.publishAuditLog(
          messageData,
          data.service_name
        );

        // Emit real-time Socket.IO event
        this.employeeAuditWebSocketGateway.emitEmployeeAuditEvent({
          audit_log_id: result.id,
          service: "employee-service",
          action: data.event_type,
          payload: data.payload,
          target_user_id: data.target_user_id,
          created_at: result.created_at,
        });

        // If it's employee-specific data, emit to employee's room
        if (data.payload?.employee_id) {
          this.employeeAuditWebSocketGateway.emitToEmployee(
            data.payload.employee_id,
            {
              audit_log_id: result.id,
              action: data.event_type,
              payload: data.payload,
              created_at: result.created_at,
            }
          );
        }

        // If it's department-specific data, emit to department room
        if (data.payload?.department) {
          this.employeeAuditWebSocketGateway.emitToDepartment(
            data.payload.department,
            {
              audit_log_id: result.id,
              action: data.event_type,
              payload: data.payload,
              created_at: result.created_at,
            }
          );
        }
      }
    } catch (error) {
      console.error("Failed to create audit log:", error);
    }
  }

  async createUserAuditLog(
    userId: string,
    serviceName: string,
    eventType: "INSERT" | "UPDATE" | "DELETE",
    payload: Record<string, any>,
    app: string = "employee-management"
  ): Promise<void> {
    await this.createAuditLog({
      app,
      service_name: serviceName,
      event_type: eventType,
      payload,
      target_user_id: userId,
    });
  }

  async createSystemAuditLog(
    serviceName: string,
    eventType: "INSERT" | "UPDATE" | "DELETE",
    payload: Record<string, any>,
    app: string = "employee-management"
  ): Promise<void> {
    await this.createAuditLog({
      app,
      service_name: serviceName,
      event_type: eventType,
      payload,
    });
  }
}
