import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class AuthGateway {
  @WebSocketServer()
  server: Server;

  sendNotification(data: any) {
    this.server.emit('auth-activity', data);
  }
}