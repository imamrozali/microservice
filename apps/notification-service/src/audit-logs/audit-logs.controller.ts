import { Controller, Get, Post, Body, Param, Query, Delete } from '@nestjs/common';
import { AuditLogsService, CreateAuditLogDto, AuditLog } from './audit-logs.service';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Post()
  async create(@Body() createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    return this.auditLogsService.create(createAuditLogDto);
  }

  @Get()
  async findAll(
    @Query('user_id') userId?: string,
    @Query('entity_type') entityType?: string,
    @Query('action_type') actionType?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{ data: AuditLog[]; total: number }> {
    return this.auditLogsService.findAll({
      user_id: userId,
      entity_type: entityType,
      action_type: actionType,
      start_date: startDate,
      end_date: endDate,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('user/:userId')
  async findByUser(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ): Promise<AuditLog[]> {
    return this.auditLogsService.findByUser(
      userId,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<AuditLog | null> {
    return this.auditLogsService.findOne(id);
  }

  @Delete('old')
  async deleteOld(@Query('days') days?: string): Promise<{ deleted: number }> {
    const deleted = await this.auditLogsService.deleteOld(
      days ? parseInt(days, 10) : undefined,
    );
    return { deleted };
  }
}
