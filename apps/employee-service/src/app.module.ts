import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { DatabaseModule } from "@repo/database";
import { EmployeesModule } from "./employees/employees.module";
import { JwtStrategy } from "./auth/jwt.strategy";
import { AuditService } from "./audit/audit.service";
import { RabbitMQService } from "./rabbitmq/rabbitmq.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule.forRoot(),
    PassportModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: process.env.JWT_SECRET || "fallback-secret-key",
        signOptions: {
          expiresIn: (process.env.JWT_EXPIRES_IN || "24h") as any,
        },
      }),
    }),
    EmployeesModule,
  ],
  providers: [JwtStrategy, RabbitMQService],
})
export class AppModule {}
