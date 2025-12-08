import { Injectable } from '@nestjs/common';
import { dbLogs } from '../database/connection';

export interface CreateAuditLogDto {
  user_id: string;
  entity_type: string;
  action_type: string;
  old_data?: any;
  new_data?: any;
  ip_address?: string;
  user_agent?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  entity_type: string;
  action_type: string;
  old_data: any;
  new_data: any;
  ip_address: string;
  user_agent: string;
  created_at: Date;
}

@Injectable()
export class AuditLogsService {
  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const [auditLog] = await dbLogs('audit_logs')
      .insert(createAuditLogDto)
      .returning('*');

    return auditLog;
  }

  async findAll(filters?: {
    user_id?: string;
    entity_type?: string;
    action_type?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: AuditLog[]; total: number }> {
    const query = dbLogs('audit_logs').select('*');

    if (filters?.user_id) {
      query.where('user_id', filters.user_id);
    }

    if (filters?.entity_type) {
      query.where('entity_type', filters.entity_type);
    }

    if (filters?.action_type) {
      query.where('action_type', filters.action_type);
    }

    if (filters?.start_date) {
      query.where('created_at', '>=', filters.start_date);
    }

    if (filters?.end_date) {
      query.where('created_at', '<=', filters.end_date);
    }

    // Get total count
    const [{ count }] = await query.clone().count('* as count');

    // Apply pagination
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    const data = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      data,
      total: Number(count),
    };
  }

  async findOne(id: string): Promise<AuditLog | null> {
    const auditLog = await dbLogs('audit_logs')
      .where({ id })
      .first();

    return auditLog || null;
  }

  async findByUser(userId: string, limit = 50): Promise<AuditLog[]> {
    return dbLogs('audit_logs')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .limit(limit);
  }

  async deleteOld(daysOld = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const deleted = await dbLogs('audit_logs')
      .where('created_at', '<', cutoffDate)
      .delete();

    return deleted;
  }
}
