import { Controller, Get, Query, UseGuards, Param } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuditService } from "./audit.service";

@Controller("audit")
@UseGuards(AuthGuard("jwt"))
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get("unprocessed")
  async getUnprocessedLogs(@Query("limit") limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 100;
    return await this.auditService.getUnprocessedLogs(limitNumber);
  }

  @Get("service/:serviceName")
  async getLogsByService(
    @Param("serviceName") serviceName: string,
    @Query("limit") limit?: string
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 100;
    return await this.auditService.getLogsByService(serviceName, limitNumber);
  }

  @Get("user/:userId")
  async getLogsByUser(
    @Param("userId") userId: string,
    @Query("limit") limit?: string
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 100;
    return await this.auditService.getLogsByUser(userId, limitNumber);
  }
}
