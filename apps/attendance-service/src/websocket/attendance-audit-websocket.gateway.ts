import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
@WebSocketGateway({
  cors: {
    origin: "*",
    credentials: true,
  },
  namespace: "/attendance-audit",
})
export class AttendanceAuditWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger("AttendanceAuditWebSocketGateway");

  afterInit(server: Server) {
    this.logger.log("Attendance Audit WebSocket Gateway initialized");
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(
      `Client connected to attendance audit namespace: ${client.id}`
    );

    // Join default attendance audit room
    client.join("attendance-audit-room");

    // Notify client of successful connection
    client.emit("attendance-audit-connected", {
      message: "Connected to attendance audit stream",
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(
      `Client disconnected from attendance audit namespace: ${client.id}`
    );
  }

  // Emit attendance audit event to all connected clients
  emitAttendanceAuditEvent(eventData: any) {
    this.server.to("attendance-audit-room").emit("attendance-audit-event", {
      ...eventData,
      service: "attendance-service",
      timestamp: new Date().toISOString(),
      server_timestamp: Date.now(),
    });

    this.logger.debug(
      `Attendance audit event emitted: ${eventData.action || eventData.event_type}`
    );
  }

  // Emit real-time attendance check-in/out events
  emitAttendanceAction(eventData: any) {
    this.server.to("attendance-audit-room").emit("attendance-action", {
      ...eventData,
      service: "attendance-service",
      event_category: "attendance-action",
      timestamp: new Date().toISOString(),
      server_timestamp: Date.now(),
    });

    this.logger.debug(
      `Attendance action emitted: ${eventData.action} for employee ${eventData.employee_id}`
    );
  }

  // Emit to specific employee
  emitToEmployee(employeeId: string, eventData: any) {
    this.server.to(`employee-${employeeId}`).emit("employee-attendance-audit", {
      ...eventData,
      service: "attendance-service",
      timestamp: new Date().toISOString(),
      server_timestamp: Date.now(),
    });
  }

  // Join employee-specific room
  joinEmployeeRoom(client: Socket, employeeId: string) {
    client.join(`employee-${employeeId}`);
    this.logger.log(
      `Client ${client.id} joined employee attendance room: employee-${employeeId}`
    );
  }

  // Emit to supervisors or managers
  emitToSupervisors(eventData: any) {
    this.server.to("supervisors-room").emit("supervisor-attendance-alert", {
      ...eventData,
      service: "attendance-service",
      recipient: "supervisors",
      timestamp: new Date().toISOString(),
      server_timestamp: Date.now(),
    });
  }

  // Join supervisors room
  joinSupervisorsRoom(client: Socket) {
    client.join("supervisors-room");
    this.logger.log(`Client ${client.id} joined supervisors room`);
  }

  // Emit attendance reports access
  emitReportAccess(eventData: any) {
    this.server.to("attendance-audit-room").emit("attendance-report-access", {
      ...eventData,
      service: "attendance-service",
      event_category: "report-access",
      timestamp: new Date().toISOString(),
      server_timestamp: Date.now(),
    });
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.server.sockets.sockets.size;
  }

  // Broadcast attendance service stats
  broadcastAttendanceServiceStats() {
    const stats = {
      connectedClients: this.getConnectedClientsCount(),
      service: "attendance-service",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };

    this.server
      .to("attendance-audit-room")
      .emit("attendance-service-stats", stats);
  }

  // Emit daily attendance summary
  emitDailyAttendanceSummary(summaryData: any) {
    this.server.to("attendance-audit-room").emit("daily-attendance-summary", {
      ...summaryData,
      service: "attendance-service",
      event_type: "daily-summary",
      timestamp: new Date().toISOString(),
      server_timestamp: Date.now(),
    });
  }
}
