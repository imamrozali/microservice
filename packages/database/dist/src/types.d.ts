import { Generated } from "kysely";
export interface TimestampColumns {
    created_at: Generated<Date>;
    updated_at?: Date;
}
export interface Roles {
    id: Generated<string>;
    code: string;
    name: string;
    created_at: Generated<Date>;
}
export interface Users {
    id: Generated<string>;
    email: string;
    password_hash: string;
    role_id: string;
    is_active: Generated<boolean>;
    created_at: Generated<Date>;
    updated_at: Date | null;
}
export interface EmployeeProfiles {
    id: Generated<string>;
    user_id: string;
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
    id: Generated<string>;
    user_id: string;
    event_type: "IN" | "OUT";
    event_time: Date;
    event_date: Date;
    timezone: string;
    agent: string | null;
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
export interface AuditLogs {
    id: Generated<string>;
    app: string;
    service_name: string;
    event_type: "INSERT" | "UPDATE" | "DELETE";
    payload: Record<string, any>;
    target_user_id: string | null;
    is_read: Generated<boolean>;
    created_at: Generated<Date>;
    processed_at: Date | null;
    processed_by: string | null;
}
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
export type Database = DatabaseMain & DatabaseLogs;
export declare enum DatabaseName {
    MAIN = "db-main",
    LOGS = "db-logs"
}
