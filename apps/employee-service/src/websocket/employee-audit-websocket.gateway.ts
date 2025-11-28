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
  namespace: "/employee-audit",
})
export class EmployeeAuditWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger("EmployeeAuditWebSocketGateway");

  afterInit(server: Server) {
    this.logger.log("Employee Audit WebSocket Gateway initialized");
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(
      `Client connected to employee audit namespace: ${client.id}`
    );

    // Join default employee audit room
    client.join("employee-audit-room");

    // Notify client of successful connection
    client.emit("employee-audit-connected", {
      message: "Connected to employee audit stream",
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(
      `Client disconnected from employee audit namespace: ${client.id}`
    );
  }

  // Emit employee audit event to all connected clients
  emitEmployeeAuditEvent(eventData: any) {
    this.server.to("employee-audit-room").emit("employee-audit-event", {
      ...eventData,
      service: "employee-service",
      timestamp: new Date().toISOString(),
      server_timestamp: Date.now(),
    });

    this.logger.debug(
      `Employee audit event emitted: ${eventData.action || eventData.event_type}`
    );
  }

  // Emit to specific department
  emitToDepartment(department: string, eventData: any) {
    this.server.to(`department-${department}`).emit("department-audit-event", {
      ...eventData,
      service: "employee-service",
      timestamp: new Date().toISOString(),
      server_timestamp: Date.now(),
    });
  }

  // Join department-specific room
  joinDepartmentRoom(client: Socket, department: string) {
    client.join(`department-${department}`);
    this.logger.log(
      `Client ${client.id} joined department room: department-${department}`
    );
  }

  // Emit to specific employee
  emitToEmployee(employeeId: string, eventData: any) {
    this.server.to(`employee-${employeeId}`).emit("employee-specific-audit", {
      ...eventData,
      service: "employee-service",
      timestamp: new Date().toISOString(),
      server_timestamp: Date.now(),
    });
  }

  // Join employee-specific room
  joinEmployeeRoom(client: Socket, employeeId: string) {
    client.join(`employee-${employeeId}`);
    this.logger.log(
      `Client ${client.id} joined employee room: employee-${employeeId}`
    );
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.server.sockets.sockets.size;
  }

  // Broadcast employee service stats
  broadcastEmployeeServiceStats() {
    const stats = {
      connectedClients: this.getConnectedClientsCount(),
      service: "employee-service",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };

    this.server.to("employee-audit-room").emit("employee-service-stats", stats);
  }
}
