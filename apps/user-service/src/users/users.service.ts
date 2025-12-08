import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { db } from '../database/connection';
import * as bcrypt from 'bcryptjs';
import { firstValueFrom } from 'rxjs';
import type { User } from '../entities';
import type { CreateUserDto, UpdateUserDto } from '../dto';

@Injectable()
export class UsersService {
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

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await db('users')
      .select(
        'users.id',
        'users.email',
        'users.full_name',
        'users.job_position',
        'users.phone_number',
        'users.photo_url',
        'users.profile_picture',
        'users.role_id',
        'users.is_active',
        'users.created_at',
        'users.updated_at',
        'users.deleted_at',
        'roles.role_name as role_name'
      )
      .leftJoin('roles', 'users.role_id', 'roles.id')
      .whereNull('users.deleted_at')
      .orderBy('users.created_at', 'desc');

    return users.map(user => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      job_position: user.job_position,
      phone_number: user.phone_number,
      photo_url: user.photo_url,
      profile_picture: user.profile_picture,
      role_id: user.role_id,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      deleted_at: user.deleted_at,
      role: user.role_name ? { role_name: user.role_name } : null,
    }));
  }

  async findById(id: string): Promise<Omit<User, 'password'> | undefined> {
    const user = await db('users')
      .select(
        'users.id',
        'users.email',
        'users.full_name',
        'users.job_position',
        'users.phone_number',
        'users.photo_url',
        'users.profile_picture',
        'users.role_id',
        'users.is_active',
        'users.created_at',
        'users.updated_at',
        'users.deleted_at',
        'roles.role_name as role_name'
      )
      .leftJoin('roles', 'users.role_id', 'roles.id')
      .where('users.id', id)
      .whereNull('users.deleted_at')
      .first();

    if (!user) return undefined;

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      job_position: user.job_position,
      phone_number: user.phone_number,
      photo_url: user.photo_url,
      profile_picture: user.profile_picture,
      role_id: user.role_id,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      deleted_at: user.deleted_at,
      role: user.role_name ? { role_name: user.role_name } : null,
    };
  }

  async findByIdIncludingDeleted(id: string): Promise<Omit<User, 'password'> | undefined> {
    const user = await db('users')
      .select(
        'users.id',
        'users.email',
        'users.full_name',
        'users.job_position',
        'users.phone_number',
        'users.photo_url',
        'users.profile_picture',
        'users.role_id',
        'users.is_active',
        'users.created_at',
        'users.updated_at',
        'users.deleted_at',
        'roles.role_name as role_name'
      )
      .leftJoin('roles', 'users.role_id', 'roles.id')
      .where('users.id', id)
      .first();

    if (!user) return undefined;

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      job_position: user.job_position,
      phone_number: user.phone_number,
      photo_url: user.photo_url,
      profile_picture: user.profile_picture,
      role_id: user.role_id,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      deleted_at: user.deleted_at,
      role: user.role_name ? { role_name: user.role_name } : null,
    };
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await db('users').where('email', email).first();
  }

  async create(data: CreateUserDto): Promise<Omit<User, 'password'>> {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const [user] = await db('users')
      .insert({
        ...data,
        password: hashedPassword,
      })
      .returning(['id', 'email', 'full_name', 'job_position', 'phone_number', 'photo_url', 'role_id', 'is_active', 'created_at', 'updated_at']);

    return user;
  }

  async update(
    id: string,
    data: UpdateUserDto
  ): Promise<Omit<User, 'password'> | undefined> {
    // Get current user data to detect changes
    const currentUser = await this.findById(id);
    
    const updateData = { ...data };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const [user] = await db('users')
      .where('id', id)
      .update({ ...updateData, updated_at: new Date() })
      .returning(['id', 'email', 'full_name', 'job_position', 'phone_number', 'photo_url', 'profile_picture', 'role_id', 'is_active', 'created_at', 'updated_at']);

    // Create notifications for profile changes
    if (currentUser && user) {
      const changes: any = {};
      
      if (data.full_name && data.full_name !== currentUser.full_name) {
        changes.full_name = { from: currentUser.full_name, to: data.full_name };
      }
      
      if (data.job_position && data.job_position !== currentUser.job_position) {
        changes.job_position = { from: currentUser.job_position, to: data.job_position };
      }
      
      if (data.phone_number && data.phone_number !== currentUser.phone_number) {
        changes.phone_number = { from: currentUser.phone_number, to: data.phone_number };
      }

      if (Object.keys(changes).length > 0) {
        const changedFields = Object.keys(changes).join(', ');
        await this.createNotification(
          id,
          'profile_update',
          'Profile Updated',
          `${user.email} updated profile: ${changedFields}`,
          { email: user.email, changes, timestamp: new Date().toISOString() }
        );
      }
    }

    return user;
  }

  async updatePhotoOnly(id: string, fileName: string): Promise<void> {
    const user = await this.findById(id);
    
    await db('users')
      .where('id', id)
      .update({ profile_picture: fileName, updated_at: new Date() });

    // Create notification for photo update
    if (user) {
      await this.createNotification(
        id,
        'photo_update',
        'Profile Photo Updated',
        `${user.email} updated profile photo`,
        { email: user.email, timestamp: new Date().toISOString() }
      );
    }
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await db('users')
      .where('id', id)
      .update({ deleted_at: new Date() });
    return deleted > 0;
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  }

  async verifyCredentials(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await db('users')
      .select('users.*', 'roles.role_name')
      .leftJoin('roles', 'users.role_id', 'roles.id')
      .where('users.email', email)
      .first();
    
    if (!user || !user.is_active) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Get user with password
    const user = await db('users')
      .select('*')
      .where('id', userId)
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db('users')
      .where('id', userId)
      .update({
        password: hashedPassword,
        updated_at: new Date(),
      });

    // Create notification for password change
    await this.createNotification(
      userId,
      'password_change',
      'Password Changed',
      `${user.email} changed their password`,
      { email: user.email, timestamp: new Date().toISOString() }
    );
  }
}
