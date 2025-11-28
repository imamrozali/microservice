import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { Kysely } from "kysely";
import { DatabaseMain, DATABASE_MAIN_TOKEN } from "@repo/database";
import { AuditService } from "../audit/audit.service";

export interface CreateUserData {
  email: string;
  password_hash: string;
  role_code: string;
}

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_MAIN_TOKEN)
    private db: Kysely<DatabaseMain>,
    private auditService: AuditService
  ) {}

  async findByEmail(email: string) {
    return await this.db
      .selectFrom("users")
      .innerJoin("roles", "roles.id", "users.role_id")
      .leftJoin("employee_profiles", "employee_profiles.user_id", "users.id")
      .select([
        "users.id",
        "users.email",
        "users.password_hash",
        "users.is_active",
        "users.created_at",
        "users.updated_at",
        "roles.code as role_code",
        "roles.name as role_name",
        "employee_profiles.full_name",
        "employee_profiles.position",
      ])
      .where("users.email", "=", email)
      .where("users.is_active", "=", true)
      .executeTakeFirst();
  }

  async findById(id: string) {
    const user = await this.db
      .selectFrom("users")
      .innerJoin("roles", "roles.id", "users.role_id")
      .leftJoin("employee_profiles", "employee_profiles.user_id", "users.id")
      .select([
        "users.id",
        "users.email",
        "users.is_active",
        "users.created_at",
        "users.updated_at",
        "roles.code as role_code",
        "roles.name as role_name",
        "employee_profiles.full_name",
        "employee_profiles.position",
        "employee_profiles.phone_number",
        "employee_profiles.employee_number",
      ])
      .where("users.id", "=", id)
      .where("users.is_active", "=", true)
      .executeTakeFirst();

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async create(userData: CreateUserData) {
    // Get role by code
    const role = await this.db
      .selectFrom("roles")
      .select("id")
      .where("code", "=", userData.role_code)
      .executeTakeFirst();

    if (!role) {
      throw new NotFoundException(`Role ${userData.role_code} not found`);
    }

    // Create user
    const [user] = await this.db
      .insertInto("users")
      .values({
        email: userData.email,
        password_hash: userData.password_hash,
        role_id: role.id,
      })
      .returning(["id", "email", "created_at"])
      .execute();

    // Log user creation
    await this.auditService.createUserAuditLog(
      user.id,
      "auth-service",
      "INSERT",
      {
        action: "user_created",
        email: userData.email,
        role_code: userData.role_code,
        created_at: user.created_at,
      }
    );

    // Return user with role information
    return await this.findById(user.id);
  }

  async updatePassword(id: string, password_hash: string) {
    const user = await this.findById(id);

    await this.db
      .updateTable("users")
      .set({
        password_hash,
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .execute();

    // Log password update
    await this.auditService.createUserAuditLog(id, "auth-service", "UPDATE", {
      action: "password_updated",
      email: user.email,
      updated_at: new Date().toISOString(),
    });

    return await this.findById(id);
  }

  async updateEmail(id: string, email: string) {
    const user = await this.findById(id);
    const oldEmail = user.email;

    await this.db
      .updateTable("users")
      .set({
        email,
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .execute();

    // Log email update
    await this.auditService.createUserAuditLog(id, "auth-service", "UPDATE", {
      action: "email_updated",
      old_email: oldEmail,
      new_email: email,
      updated_at: new Date().toISOString(),
    });

    return await this.findById(id);
  }

  async deactivateUser(id: string) {
    const user = await this.findById(id);

    await this.db
      .updateTable("users")
      .set({
        is_active: false,
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .execute();

    // Log user deactivation
    await this.auditService.createUserAuditLog(id, "auth-service", "UPDATE", {
      action: "user_deactivated",
      email: user.email,
      deactivated_at: new Date().toISOString(),
    });
  }
}
