import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { WebSocketGatewayService } from './websocket/websocket.gateway';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly websocketGateway: WebSocketGatewayService,
  ) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
    };
  }
}
