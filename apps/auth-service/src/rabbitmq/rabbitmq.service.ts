import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async onModuleInit() {
    try {
      const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}${process.env.RABBITMQ_VHOST}`;
      
      this.connection = await amqp.connect(rabbitMQUrl);
      this.channel = await this.connection.createChannel();

      // Declare exchange
      await this.channel.assertExchange(
        process.env.AUDIT_EXCHANGE_NAME || 'audit-exchange',
        'topic',
        { durable: true }
      );

      console.log('✅ RabbitMQ connected and exchange declared');
    } catch (error) {
      console.error('❌ Failed to connect to RabbitMQ:', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.connection?.close();
      console.log('RabbitMQ connection closed');
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
    }
  }

  async publishAuditLog(auditLog: any) {
    try {
      if (!this.channel) {
        console.error('RabbitMQ channel is not initialized');
        return;
      }

      const exchange = process.env.AUDIT_EXCHANGE_NAME || 'audit-exchange';
      const routingKey = process.env.AUDIT_ROUTING_KEY || 'audit.log';

      this.channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(auditLog)),
        { persistent: true }
      );

      console.log(`📤 Audit log published: ${auditLog.action_type}`);
    } catch (error) {
      console.error('Failed to publish audit log:', error);
    }
  }
}
