import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(private auditLogsService: AuditLogsService) {}

  async onModuleInit() {
    try {
      const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}${process.env.RABBITMQ_VHOST}`;
      
      this.connection = await amqp.connect(rabbitMQUrl);
      this.channel = await this.connection.createChannel();

      const exchange = process.env.AUDIT_EXCHANGE_NAME || 'audit-exchange';
      const queueName = process.env.AUDIT_QUEUE_NAME || 'audit-logs';
      const routingKey = process.env.AUDIT_ROUTING_KEY || 'audit.log';

      // Declare exchange
      await this.channel.assertExchange(exchange, 'topic', { durable: true });

      // Declare queue
      await this.channel.assertQueue(queueName, { durable: true });

      // Bind queue to exchange
      await this.channel.bindQueue(queueName, exchange, routingKey);

      // Consume messages
      this.channel.consume(queueName, async (msg) => {
        if (msg) {
          try {
            const auditLog = JSON.parse(msg.content.toString());
            console.log('📥 Received audit log:', auditLog.action_type);
            
            // Save to database
            await this.auditLogsService.create(auditLog);
            
            this.channel.ack(msg);
          } catch (error) {
            console.error('Error processing audit log:', error);
            this.channel.nack(msg, false, false);
          }
        }
      });

      console.log('✅ RabbitMQ consumer ready and listening for audit logs');
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
}
