import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import * as amqp from "amqplib/callback_api";

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: any = null;
  private channel: any = null;
  private readonly exchangeName =
    process.env.AUDIT_EXCHANGE_NAME || "audit-exchange";
  private readonly queueName = process.env.AUDIT_QUEUE_NAME || "audit-logs";
  private readonly routingKey = process.env.AUDIT_ROUTING_KEY || "audit.log";

  async onModuleInit() {
    try {
      await this.connect();
      await this.setupExchangeAndQueue();
    } catch (error) {
      console.error("Failed to initialize RabbitMQ connection:", error);
    }
  }

  async onModuleDestroy() {
    try {
      if (this.channel) {
        this.channel.close();
      }
      if (this.connection) {
        this.connection.close();
      }
    } catch (error) {
      console.error("Failed to close RabbitMQ connection:", error);
    }
  }

  private async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const rabbitMQUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}${process.env.RABBITMQ_VHOST}`;

      amqp.connect(rabbitMQUrl, (connectionError: any, connection: any) => {
        if (connectionError) {
          return reject(connectionError);
        }

        this.connection = connection;

        connection.createChannel((channelError: any, channel: any) => {
          if (channelError) {
            return reject(channelError);
          }

          this.channel = channel;
          console.log("Connected to RabbitMQ successfully");
          resolve();
        });
      });
    });
  }

  private async setupExchangeAndQueue(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.channel) {
        return reject(new Error("RabbitMQ channel not available"));
      }

      // Create exchange
      this.channel.assertExchange(
        this.exchangeName,
        "topic",
        { durable: true },
        (exchangeError: any) => {
          if (exchangeError) {
            return reject(exchangeError);
          }

          // Create queue
          this.channel.assertQueue(
            this.queueName,
            { durable: true },
            (queueError: any) => {
              if (queueError) {
                return reject(queueError);
              }

              // Bind queue to exchange
              this.channel.bindQueue(
                this.queueName,
                this.exchangeName,
                this.routingKey,
                {},
                (bindError: any) => {
                  if (bindError) {
                    return reject(bindError);
                  }

                  console.log(
                    `RabbitMQ exchange '${this.exchangeName}' and queue '${this.queueName}' setup completed`
                  );
                  resolve();
                }
              );
            }
          );
        }
      );
    });
  }

  async publishAuditLog(auditLogData: any, serviceName: string): Promise<void> {
    try {
      if (!this.channel) {
        console.error(
          "RabbitMQ channel not available, cannot publish audit log"
        );
        return;
      }

      const message = {
        ...auditLogData,
        service_name: serviceName,
        timestamp: new Date().toISOString(),
        message_id: this.generateMessageId(),
      };

      const messageBuffer = Buffer.from(JSON.stringify(message));

      const published = this.channel.publish(
        this.exchangeName,
        this.routingKey,
        messageBuffer,
        {
          persistent: true,
          messageId: message.message_id,
          timestamp: Date.now(),
        }
      );

      if (published) {
        console.log(`Audit log published to RabbitMQ: ${message.message_id}`);
      }
    } catch (error) {
      console.error("Failed to publish audit log to RabbitMQ:", error);
    }
  }

  private generateMessageId(): string {
    return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}
