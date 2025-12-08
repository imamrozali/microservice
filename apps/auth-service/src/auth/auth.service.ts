import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { db } from '../database/connection';
import * as bcrypt from 'bcryptjs';
import { firstValueFrom } from 'rxjs';
import type { LoginDto, TokenResponseDto } from './auth.dto';
import { WebSocketGatewayService } from '../websocket/websocket.gateway';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

interface User {
  id: string;
  email: string;
  password: string;
  full_name: string;
  role_id: string;
  is_active: boolean;
}

@Injectable()
export class AuthService {
  private readonly userServiceUrl = `${process.env.USER_SERVICE_URL}/api`;

  constructor(
    private jwtService: JwtService,
    private httpService: HttpService,
    private websocketGateway: WebSocketGatewayService,
    private rabbitMQService: RabbitMQService,
  ) {}

  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    try {
      // Fetch user from User Service
      const response = await firstValueFrom(
        this.httpService.post(`${this.userServiceUrl}/users/verify`, {
          email: loginDto.email,
          password: loginDto.password,
        }),
      );

      const user = response.data;

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const tokens = await this.generateTokens(user);

      // Create notification in notification service
      try {
        await firstValueFrom(
          this.httpService.post(`${process.env.NOTIFICATION_SERVICE_URL}/api/notifications`, {
            user_id: user.id,
            notification_type: 'login',
            title: 'User Login',
            message: `${user.email} logged in`,
            metadata: { email: user.email, full_name: user.full_name, timestamp: new Date().toISOString() },
          }),
        );
      } catch (error: any) {
        console.error('Failed to create login notification:', error?.message || 'Unknown error');
      }

      // Emit login notification to admin via WebSocket (legacy)
      this.websocketGateway.emitLoginNotification({
        event: 'user-login',
        userId: user.id,
        email: user.email,
        full_name: user.full_name,
        timestamp: new Date().toISOString(),
        message: `User ${user.full_name} logged in successfully`,
      });

      // Publish audit log to RabbitMQ
      try {
        await this.rabbitMQService.publishAuditLog({
          user_id: user.id,
          entity_type: 'auth',
          action_type: 'login',
          old_data: null,
          new_data: {
            email: user.email,
            full_name: user.full_name,
            login_time: new Date().toISOString(),
          },
          ip_address: null,
          user_agent: null,
        });
      } catch (error: any) {
        console.error('Failed to publish audit log:', error?.message || 'Unknown error');
      }

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role_id: user.role_id,
          role_name: user.role_name,
          photo_url: user.photo_url || null,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    // Get all tokens for user
    const tokens = await db('refresh_tokens').where({ user_id: userId });
    
    // Find matching token using bcrypt.compare
    for (const token of tokens) {
      const isMatch = await bcrypt.compare(refreshToken, token.token_hash);
      if (isMatch) {
        await db('refresh_tokens').where({ id: token.id }).delete();
        return;
      }
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      // Get all tokens for user
      const tokens = await db('refresh_tokens').where({ user_id: payload.sub });
      
      let storedToken = null;
      // Find matching token using bcrypt.compare
      for (const token of tokens) {
        const isMatch = await bcrypt.compare(refreshToken, token.token_hash);
        if (isMatch) {
          storedToken = token;
          break;
        }
      }

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (new Date(storedToken.expires_at) < new Date()) {
        await db('refresh_tokens').where({ id: storedToken.id }).delete();
        throw new UnauthorizedException('Refresh token expired');
      }

      // Fetch user from User Service
      const response = await firstValueFrom(
        this.httpService.get(`${this.userServiceUrl}/users/${payload.sub}`),
      );
      const user = response.data;
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Delete old refresh token
      await db('refresh_tokens').where({ id: storedToken.id }).delete();

      return await this.generateTokens(user as User);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async generateTokens(user: User): Promise<TokenResponseDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      role_id: user.role_id,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    // Store refresh token
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db('refresh_tokens').insert({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
      device_info: 'web',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 900, // 15 minutes in seconds
    };
  }

  async cleanupExpiredTokens(): Promise<void> {
    await db('refresh_tokens')
      .where('expires_at', '<', new Date())
      .delete();
  }
}
