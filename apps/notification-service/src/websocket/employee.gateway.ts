import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class EmployeeGateway {
  @WebSocketServer()
  server: Server;

  sendNotification(data: any) {
    this.server.emit('employee-activity', data);
  }
}