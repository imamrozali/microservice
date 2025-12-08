import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { WebSocketGatewayService } from './websocket/websocket.gateway';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly websocketGateway: WebSocketGatewayService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'user-service',
      timestamp: new Date().toISOString(),
    };
  }
}
