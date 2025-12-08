import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { db } from '../database/connection';
import { firstValueFrom } from 'rxjs';
import type { AttendanceEvent, AttendanceSummary } from '../entities';
import type { CreateAttendanceEventDto } from '../dto';

@Injectable()
export class AttendanceService {
  constructor(private httpService: HttpService) {}

  private async createNotification(user_id: string, notification_type: string, title: string, message: string, metadata?: any) {
    try {
      await firstValueFrom(
        this.httpService.post(`${process.env.NOTIFICATION_SERVICE_URL}/api/notifications`, {
          user_id,
          notification_type,
          title,
          message,
          metadata,
        }),
      );
    } catch (error: any) {
      console.error('Failed to create notification:', error.message);
    }
  }

  async findAll(): Promise<AttendanceEvent[]> {
    return await db('attendance_events')
      .select('*')
      .orderBy('event_time', 'desc');
  }

  async findById(id: string): Promise<AttendanceEvent | undefined> {
    return await db('attendance_events').where('id', id).first();
  }

  async findByEmployeeId(employeeId: string): Promise<AttendanceEvent[]> {
    return await db('attendance_events')
      .where('employee_id', employeeId)
      .orderBy('event_time', 'desc');
  }

  async create(data: CreateAttendanceEventDto): Promise<AttendanceEvent> {
    const [event] = await db('attendance_events').insert(data).returning('*');
    return event;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await db('attendance_events').where('id', id).del();
    return deleted > 0;
  }

  async getSummary(
    employeeId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AttendanceSummary[]> {
    // Build query to get attendance with aggregation
    let query = db('attendance')
      .select(
        'user_id',
        db.raw('COUNT(*) as total_days'),
        db.raw("COUNT(CASE WHEN status = 'MASUK' OR status = 'PULANG' THEN 1 END) as present_days"),
        db.raw("COUNT(CASE WHEN status = 'INCOMPLETE' THEN 1 END) as incomplete_days"),
        db.raw('MIN(attendance_date) as first_attendance'),
        db.raw('MAX(attendance_date) as last_attendance'),
      )
      .groupBy('user_id');

    if (employeeId) {
      query = query.where('user_id', employeeId);
    }

    if (startDate) {
      query = query.where('attendance_date', '>=', startDate.toISOString().split('T')[0]);
    }

    if (endDate) {
      query = query.where('attendance_date', '<=', endDate.toISOString().split('T')[0]);
    }

    return await query;
  }

  async getEventsByDateRange(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AttendanceEvent[]> {
    return await db('attendance_events')
      .where('employee_id', employeeId)
      .whereBetween('event_time', [startDate, endDate])
      .orderBy('event_time', 'desc');
  }

  async checkIn(userId: string, latitude?: number, longitude?: number) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS format
    
    // Check if already checked in today
    const existing = await db('attendance')
      .where('user_id', userId)
      .where('attendance_date', today)
      .first();

    if (existing) {
      throw new Error('Already checked in today');
    }

    const [record] = await db('attendance')
      .insert({
        user_id: userId,
        attendance_date: today,
        check_in_time: currentTime,
        latitude,
        longitude,
        status: 'MASUK',
      })
      .returning('*');

    // Get user email for notification
    const user = await db('users').where('id', userId).select('email').first();
    
    // Create notification for clock in
    if (user) {
      await this.createNotification(
        userId,
        'clock_in',
        'Clock In',
        `${user.email} clocked in at ${currentTime}`,
        { email: user.email, check_in_time: now.toISOString(), latitude, longitude }
      );
    }

    return record;
  }

  async checkOut(userId: string, latitude?: number, longitude?: number) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS format
    
    // Find today's attendance record
    const existing = await db('attendance')
      .where('user_id', userId)
      .where('attendance_date', today)
      .first();

    if (!existing) {
      throw new Error('No check-in record found for today');
    }

    if (existing.check_out_time) {
      throw new Error('Already checked out today');
    }

    const [record] = await db('attendance')
      .where('user_id', userId)
      .where('attendance_date', today)
      .update({
        check_out_time: currentTime,
        status: 'PULANG',
      })
      .returning('*');

    // Get user email for notification
    const user = await db('users').where('id', userId).select('email').first();
    
    // Create notification for clock out
    if (user) {
      await this.createNotification(
        userId,
        'clock_out',
        'Clock Out',
        `${user.email} clocked out at ${currentTime}`,
        { email: user.email, check_out_time: now.toISOString(), latitude, longitude }
      );
    }

    return record;
  }

  async getTodayAttendance(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    return await db('attendance')
      .where('user_id', userId)
      .where('attendance_date', today)
      .first();
  }

  async getAttendanceByDateRange(
    userId?: string,
    startDate?: string,
    endDate?: string,
  ) {
    let query = db('attendance')
      .select(
        'attendance.*',
        db.raw(`
          CASE 
            WHEN check_in_time IS NOT NULL AND check_out_time IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (check_out_time::time - check_in_time::time)) / 3600
            ELSE NULL
          END as total_work_hours
        `)
      )
      .leftJoin('users', 'attendance.user_id', 'users.id')
      .select(
        'users.email as user_email',
        'users.full_name as user_full_name',
        'users.job_position as user_job_position'
      );

    if (userId) {
      query = query.where('attendance.user_id', userId);
    }

    if (startDate) {
      query = query.where('attendance_date', '>=', startDate);
    }

    if (endDate) {
      query = query.where('attendance_date', '<=', endDate);
    }

    const results = await query.orderBy('attendance_date', 'desc');
    
    // Transform to match expected format
    return results.map(record => {
      // Convert time strings (HH:MM:SS) to proper ISO string format
      let checkInISO = null;
      let checkOutISO = null;

      // Normalize attendance_date to YYYY-MM-DD format
      let dateStr = record.attendance_date;
      if (record.attendance_date instanceof Date) {
        dateStr = record.attendance_date.toISOString().split('T')[0];
      } else if (typeof record.attendance_date === 'string') {
        dateStr = record.attendance_date.split('T')[0];
      }

      if (record.check_in_time && dateStr) {
        try {
          // Create Date object in local timezone (server timezone)
          const checkInDate = new Date(`${dateStr}T${record.check_in_time}`);
          if (!isNaN(checkInDate.getTime())) {
            checkInISO = checkInDate.toISOString();
          }
        } catch (e) {
          console.error('Error creating check-in date:', e);
        }
      }

      if (record.check_out_time && dateStr) {
        try {
          // Create Date object in local timezone (server timezone)
          const checkOutDate = new Date(`${dateStr}T${record.check_out_time}`);
          if (!isNaN(checkOutDate.getTime())) {
            checkOutISO = checkOutDate.toISOString();
          }
        } catch (e) {
          console.error('Error creating check-out date:', e);
        }
      }

      return {
        user_id: record.user_id,
        date: dateStr,
        check_in_time: checkInISO,
        check_out_time: checkOutISO,
        total_work_hours: record.total_work_hours ? parseFloat(record.total_work_hours) : null,
        status: record.status?.toLowerCase() || 'incomplete',
        user: record.user_email ? {
          email: record.user_email,
          full_name: record.user_full_name,
          job_position: record.user_job_position,
        } : null,
      };
    });
  }
}
