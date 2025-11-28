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
  namespace: "/audit",
})
export class AuditWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger("AuditWebSocketGateway");

  afterInit(server: Server) {
    this.logger.log("Audit WebSocket Gateway initialized");
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected to audit namespace: ${client.id}`);

    // Join default audit room
    client.join("audit-room");

    // Notify client of successful connection
    client.emit("audit-connected", {
      message: "Connected to audit stream",
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from audit namespace: ${client.id}`);
  }

  // Emit audit event to all connected clients
  emitAuditEvent(eventData: any) {
    this.server.to("audit-room").emit("audit-event", {
      ...eventData,
      timestamp: new Date().toISOString(),
      server_timestamp: Date.now(),
    });

    this.logger.debug(
      `Audit event emitted: ${eventData.action || eventData.event_type}`
    );
  }

  // Emit to specific user
  emitToUser(userId: string, eventData: any) {
    this.server.to(`user-${userId}`).emit("user-audit-event", {
      ...eventData,
      timestamp: new Date().toISOString(),
      server_timestamp: Date.now(),
    });
  }

  // Join user-specific room
  joinUserRoom(client: Socket, userId: string) {
    client.join(`user-${userId}`);
    this.logger.log(`Client ${client.id} joined user room: user-${userId}`);
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.server.sockets.sockets.size;
  }

  // Broadcast server stats
  broadcastStats() {
    const stats = {
      connectedClients: this.getConnectedClientsCount(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };

    this.server.to("audit-room").emit("server-stats", stats);
  }
}
