import { ColumnType, Generated } from "kysely";

// Common types
export interface TimestampColumns {
  created_at: Generated<Date>;
  updated_at?: Date;
}

// DB-Main Schema Types
export interface Roles {
  id: Generated<string>; // UUID
  code: string;
  name: string;
  created_at: Generated<Date>;
}

export interface Users {
  id: Generated<string>; // UUID
  email: string;
  password_hash: string;
  role_id: string; // FK to roles.id
  is_active: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Date | null;
}

export interface EmployeeProfiles {
  id: Generated<string>; // UUID
  user_id: string; // FK to users.id
  full_name: string;
  photo_url: string | null;
  position: string;
  phone_number: string;
  employee_number: string;
  date_joined: Date;
  created_at: Generated<Date>;
  updated_at: Date | null;
}

export interface AttendanceEvents {
  id: Generated<string>; // UUID
  user_id: string; // FK to users.id
  event_type: "IN" | "OUT";
  event_time: Date;
  event_date: Date;
  timezone: string;
  agent: string | null; // user agent / device info
  latitude: number | null;
  longitude: number | null;
  created_at: Generated<Date>;
}

export interface AttendanceSummary {
  user_id: string;
  event_date: Date;
  time_in: Date | null;
  time_out: Date | null;
}

// DB-Logs Schema Types
export interface AuditLogs {
  id: Generated<string>; // BIGSERIAL
  app: string;
  service_name: string;
  event_type: "INSERT" | "UPDATE" | "DELETE";
  payload: Record<string, any>; // JSONB
  target_user_id: string | null; // FK to users.id (optional)
  is_read: Generated<boolean>;
  created_at: Generated<Date>;
  processed_at: Date | null;
  processed_by: string | null;
}

// Database schema interfaces
export interface DatabaseMain {
  roles: Roles;
  users: Users;
  employee_profiles: EmployeeProfiles;
  attendance_events: AttendanceEvents;
  attendance_summary: AttendanceSummary;
  seeders: {
    id: Generated<number>;
    name: string;
    executed_at: Generated<Date>;
  };
}

export interface DatabaseLogs {
  audit_logs: AuditLogs;
}

// Union type for all databases
export type Database = DatabaseMain & DatabaseLogs;

// Database names enum
export enum DatabaseName {
  MAIN = "db-main",
  LOGS = "db-logs",
}
