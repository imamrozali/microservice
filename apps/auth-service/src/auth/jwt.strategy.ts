import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface JwtPayload {
  sub: string;
  email: string;
  role_id: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly userServiceUrl = `${process.env.USER_SERVICE_URL}/api`;

  constructor(private httpService: HttpService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.userServiceUrl}/users/${payload.sub}/validate`),
      );
      const user = response.data;

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Check if user is soft deleted
      if (user.deleted_at) {
        throw new UnauthorizedException('User account has been deleted');
      }

      // Check if user is active
      if (!user.is_active) {
        throw new UnauthorizedException('User account is inactive');
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
