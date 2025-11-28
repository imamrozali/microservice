import { Injectable, Inject } from "@nestjs/common";
import { Kysely } from "kysely";
import { DatabaseLogs, DATABASE_LOGS_TOKEN } from "@repo/database";
import { RabbitMQService } from "../rabbitmq/rabbitmq.service";
import { AuditWebSocketGateway } from "../websocket/audit-websocket.gateway";

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
    private readonly auditWebSocketGateway: AuditWebSocketGateway
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
        this.auditWebSocketGateway.emitAuditEvent({
          audit_log_id: result.id,
          service: "auth-service",
          action: data.event_type,
          payload: data.payload,
          target_user_id: data.target_user_id,
          created_at: result.created_at,
        });

        // If it's a user-specific event, emit to user's room as well
        if (data.target_user_id) {
          this.auditWebSocketGateway.emitToUser(data.target_user_id, {
            audit_log_id: result.id,
            service: "auth-service",
            action: data.event_type,
            payload: data.payload,
            created_at: result.created_at,
          });
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

  async getUnprocessedLogs(limit: number = 100) {
    try {
      return await this.logsDb
        .selectFrom("audit_logs")
        .selectAll()
        .where("is_read", "=", false)
        .orderBy("created_at", "asc")
        .limit(limit)
        .execute();
    } catch (error) {
      console.error("Failed to get unprocessed audit logs:", error);
      return [];
    }
  }

  async getLogsByService(serviceName: string, limit: number = 100) {
    try {
      return await this.logsDb
        .selectFrom("audit_logs")
        .selectAll()
        .where("service_name", "=", serviceName)
        .orderBy("created_at", "desc")
        .limit(limit)
        .execute();
    } catch (error) {
      console.error("Failed to get logs by service:", error);
      return [];
    }
  }

  async getLogsByUser(userId: string, limit: number = 100) {
    try {
      return await this.logsDb
        .selectFrom("audit_logs")
        .selectAll()
        .where("target_user_id", "=", userId)
        .orderBy("created_at", "desc")
        .limit(limit)
        .execute();
    } catch (error) {
      console.error("Failed to get logs by user:", error);
      return [];
    }
  }

  async markAsProcessed(logId: string, processedBy: string): Promise<void> {
    try {
      await this.logsDb
        .updateTable("audit_logs")
        .set({
          is_read: true,
          processed_at: new Date(),
          processed_by: processedBy,
        })
        .where("id", "=", logId)
        .execute();
    } catch (error) {
      console.error("Failed to mark audit log as processed:", error);
    }
  }
}
