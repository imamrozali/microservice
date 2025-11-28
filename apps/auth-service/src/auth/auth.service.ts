import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { AuditService } from "../audit/audit.service";
import * as bcrypt from "bcrypt";

export interface JwtPayload {
  sub: string;
  email: string;
  roleCode: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: string;
    profile?: {
      fullName: string;
      position: string;
    };
  };
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private auditService: AuditService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any): Promise<AuthResponse> {
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      roleCode: user.role_code,
    };

    // Log successful login
    await this.auditService.createUserAuditLog(
      user.id,
      "auth-service",
      "UPDATE",
      {
        action: "user_login",
        email: user.email,
        role: user.role_code,
        timestamp: new Date().toISOString(),
      }
    );

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role_code,
        profile: user.full_name
          ? {
              fullName: user.full_name,
              position: user.position,
            }
          : undefined,
      },
    };
  }

  async register(
    email: string,
    password: string,
    roleCode: string = "EMPLOYEE"
  ) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException("User with this email already exists");
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await this.usersService.create({
      email,
      password_hash: hashedPassword,
      role_code: roleCode,
    });

    // Log user registration
    await this.auditService.createUserAuditLog(
      user.id,
      "auth-service",
      "INSERT",
      {
        action: "user_registration",
        email: user.email,
        role: user.role_code,
        timestamp: new Date().toISOString(),
      }
    );

    return this.login(user);
  }
}
