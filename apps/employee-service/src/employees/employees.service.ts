import { Injectable, Inject } from "@nestjs/common";
import { Kysely } from "kysely";
import { DatabaseMain, DATABASE_MAIN_TOKEN } from "@repo/database";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class EmployeesService {
  constructor(
    @Inject(DATABASE_MAIN_TOKEN)
    private db: Kysely<DatabaseMain>,
    private auditService: AuditService
  ) {}

  async findAll() {
    return await this.db
      .selectFrom("employee_profiles")
      .innerJoin("users", "users.id", "employee_profiles.user_id")
      .innerJoin("roles", "roles.id", "users.role_id")
      .select([
        "employee_profiles.id",
        "employee_profiles.user_id",
        "employee_profiles.full_name",
        "employee_profiles.position",
        "employee_profiles.phone_number",
        "employee_profiles.employee_number",
        "employee_profiles.date_joined",
        "users.email",
        "roles.name as role_name",
      ])
      .where("users.is_active", "=", true)
      .orderBy("employee_profiles.full_name")
      .execute();
  }

  async findOne(id: string) {
    return await this.db
      .selectFrom("employee_profiles")
      .innerJoin("users", "users.id", "employee_profiles.user_id")
      .innerJoin("roles", "roles.id", "users.role_id")
      .selectAll()
      .where("employee_profiles.id", "=", id)
      .executeTakeFirst();
  }

  async create(data: {
    userId: string;
    fullName: string;
    position: string;
    phoneNumber: string;
    employeeNumber: string;
    dateJoined: Date;
    photoUrl?: string;
  }) {
    const result = await this.db
      .insertInto("employee_profiles")
      .values({
        user_id: data.userId,
        full_name: data.fullName,
        position: data.position,
        phone_number: data.phoneNumber,
        employee_number: data.employeeNumber,
        date_joined: data.dateJoined,
        photo_url: data.photoUrl,
      })
      .returning(["id"])
      .executeTakeFirst();

    // Log employee profile creation
    await this.auditService.createUserAuditLog(
      data.userId,
      "employee-service",
      "INSERT",
      {
        action: "employee_profile_created",
        employee_id: result?.id,
        full_name: data.fullName,
        position: data.position,
        employee_number: data.employeeNumber,
        date_joined: data.dateJoined.toISOString(),
      }
    );

    return result;
  }

  async update(
    id: string,
    data: Partial<{
      fullName: string;
      position: string;
      phoneNumber: string;
      photoUrl: string;
    }>
  ) {
    // Get current employee data for logging
    const currentEmployee = await this.findOne(id);

    const result = await this.db
      .updateTable("employee_profiles")
      .set({
        ...(data.fullName && { full_name: data.fullName }),
        ...(data.position && { position: data.position }),
        ...(data.phoneNumber && { phone_number: data.phoneNumber }),
        ...(data.photoUrl && { photo_url: data.photoUrl }),
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .execute();

    // Log employee profile update
    if (currentEmployee) {
      await this.auditService.createUserAuditLog(
        currentEmployee.user_id,
        "employee-service",
        "UPDATE",
        {
          action: "employee_profile_updated",
          employee_id: id,
          changes: data,
          previous_data: {
            full_name: currentEmployee.full_name,
            position: currentEmployee.position,
            phone_number: currentEmployee.phone_number,
            photo_url: currentEmployee.photo_url,
          },
          updated_at: new Date().toISOString(),
        }
      );
    }

    return result;
  }
}
