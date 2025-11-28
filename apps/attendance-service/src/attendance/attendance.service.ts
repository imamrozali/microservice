import { Injectable, Inject } from "@nestjs/common";
import { Kysely } from "kysely";
import { DatabaseMain, DATABASE_MAIN_TOKEN } from "@repo/database";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class AttendanceService {
  constructor(
    @Inject(DATABASE_MAIN_TOKEN)
    private db: Kysely<DatabaseMain>,
    private auditService: AuditService
  ) {}

  async checkIn(
    userId: string,
    data: {
      latitude?: number;
      longitude?: number;
      agent?: string;
    }
  ) {
    const now = new Date();
    const today = new Date(now.toDateString());

    const result = await this.db
      .insertInto("attendance_events")
      .values({
        user_id: userId,
        event_type: "IN",
        event_time: now,
        event_date: today,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        latitude: data.latitude,
        longitude: data.longitude,
        agent: data.agent,
      })
      .returning(["id", "event_time"])
      .executeTakeFirst();

    // Log check-in event
    await this.auditService.createUserAuditLog(
      userId,
      "attendance-service",
      "INSERT",
      {
        action: "check_in",
        event_id: result?.id,
        event_time: now.toISOString(),
        event_date: today.toISOString(),
        location: {
          latitude: data.latitude,
          longitude: data.longitude,
        },
        agent: data.agent,
      }
    );

    return result;
  }

  async checkOut(
    userId: string,
    data: {
      latitude?: number;
      longitude?: number;
      agent?: string;
    }
  ) {
    const now = new Date();
    const today = new Date(now.toDateString());

    const result = await this.db
      .insertInto("attendance_events")
      .values({
        user_id: userId,
        event_type: "OUT",
        event_time: now,
        event_date: today,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        latitude: data.latitude,
        longitude: data.longitude,
        agent: data.agent,
      })
      .returning(["id", "event_time"])
      .executeTakeFirst();

    // Log check-out event
    await this.auditService.createUserAuditLog(
      userId,
      "attendance-service",
      "INSERT",
      {
        action: "check_out",
        event_id: result?.id,
        event_time: now.toISOString(),
        event_date: today.toISOString(),
        location: {
          latitude: data.latitude,
          longitude: data.longitude,
        },
        agent: data.agent,
      }
    );

    return result;
  }

  async getAttendanceSummary(userId: string, startDate: Date, endDate: Date) {
    return await this.db
      .selectFrom("attendance_summary")
      .selectAll()
      .where("user_id", "=", userId)
      .where("event_date", ">=", startDate)
      .where("event_date", "<=", endDate)
      .orderBy("event_date", "desc")
      .execute();
  }

  async getAttendanceEvents(userId: string, date?: Date) {
    let query = this.db
      .selectFrom("attendance_events")
      .selectAll()
      .where("user_id", "=", userId);

    if (date) {
      query = query.where("event_date", "=", date);
    }

    return await query.orderBy("event_time", "desc").execute();
  }

  async getEmployeesWithoutCheckIn(date: Date = new Date()) {
    const today = new Date(date.toDateString());

    return await this.db
      .selectFrom("users")
      .leftJoin("attendance_events", (join) =>
        join
          .onRef("attendance_events.user_id", "=", "users.id")
          .on("attendance_events.event_date", "=", today)
          .on("attendance_events.event_type", "=", "IN")
      )
      .leftJoin("employee_profiles", "employee_profiles.user_id", "users.id")
      .innerJoin("roles", "roles.id", "users.role_id")
      .select([
        "users.id",
        "users.email",
        "employee_profiles.full_name",
        "employee_profiles.position",
      ])
      .where("roles.code", "=", "EMPLOYEE")
      .where("users.is_active", "=", true)
      .where("attendance_events.id", "is", null)
      .execute();
  }
}
