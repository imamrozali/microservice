import { Injectable } from '@nestjs/common';
import { dbMain as db } from '../database/connection';
import { NotificationGateway } from './notification.gateway';

export interface Notification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  metadata?: any;
  is_read: boolean;
  read_at?: Date;
  created_at: Date;
}

export interface CreateNotificationDto {
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  metadata?: any;
}

@Injectable()
export class NotificationsService {
  constructor(private notificationGateway: NotificationGateway) {}

  async create(data: CreateNotificationDto): Promise<Notification> {
    const [notification] = await db('notifications')
      .insert({
        user_id: data.user_id,
        notification_type: data.notification_type,
        title: data.title,
        message: data.message,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        created_at: new Date(),
      })
      .returning('*');

    // Emit notification via WebSocket
    this.notificationGateway.emitNotification(notification);

    return notification;
  }

  async findAll(userId?: string, isRead?: boolean): Promise<Notification[]> {
    let query = db('notifications').select('*').orderBy('created_at', 'desc');

    if (userId) {
      query = query.where('user_id', userId);
    }

    if (isRead !== undefined) {
      query = query.where('is_read', isRead);
    }

    return await query;
  }

  async findById(id: string): Promise<Notification | undefined> {
    return await db('notifications').where('id', id).first();
  }

  async markAsRead(id: string): Promise<void> {
    await db('notifications')
      .where('id', id)
      .update({
        is_read: true,
        read_at: new Date(),
      });
    
    // Emit notification-read event via WebSocket
    this.notificationGateway.emitNotificationRead(id);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await db('notifications')
      .where('user_id', userId)
      .where('is_read', false)
      .update({
        is_read: true,
        read_at: new Date(),
      });
  }

  async delete(id: string): Promise<void> {
    await db('notifications').where('id', id).delete();
  }

  // Helper methods for specific notification types
  async createLoginNotification(userId: string, userEmail: string): Promise<Notification> {
    return this.create({
      user_id: userId,
      notification_type: 'login',
      title: 'User Login',
      message: `${userEmail} logged in`,
      metadata: { email: userEmail, timestamp: new Date().toISOString() },
    });
  }

  async createProfileUpdateNotification(
    userId: string,
    userEmail: string,
    changes: any
  ): Promise<Notification> {
    const changedFields = Object.keys(changes).join(', ');
    return this.create({
      user_id: userId,
      notification_type: 'profile_update',
      title: 'Profile Updated',
      message: `${userEmail} updated profile: ${changedFields}`,
      metadata: { email: userEmail, changes, timestamp: new Date().toISOString() },
    });
  }

  async createPhotoUpdateNotification(userId: string, userEmail: string): Promise<Notification> {
    return this.create({
      user_id: userId,
      notification_type: 'photo_update',
      title: 'Profile Photo Updated',
      message: `${userEmail} updated profile photo`,
      metadata: { email: userEmail, timestamp: new Date().toISOString() },
    });
  }

  async createClockInNotification(
    userId: string,
    userEmail: string,
    checkInTime: Date
  ): Promise<Notification> {
    return this.create({
      user_id: userId,
      notification_type: 'clock_in',
      title: 'Clock In',
      message: `${userEmail} clocked in`,
      metadata: { email: userEmail, check_in_time: checkInTime.toISOString() },
    });
  }

  async createClockOutNotification(
    userId: string,
    userEmail: string,
    checkOutTime: Date
  ): Promise<Notification> {
    return this.create({
      user_id: userId,
      notification_type: 'clock_out',
      title: 'Clock Out',
      message: `${userEmail} clocked out`,
      metadata: { email: userEmail, check_out_time: checkOutTime.toISOString() },
    });
  }
}
