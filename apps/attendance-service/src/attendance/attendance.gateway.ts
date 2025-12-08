import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class AttendanceGateway {
  @WebSocketServer()
  server: Server;

  sendNotification(data: any) {
    this.server.emit('attendance-activity', data);
  }
}