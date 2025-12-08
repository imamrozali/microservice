export interface AttendanceEvent {
  id: string;
  employee_id: string;
  event_type: string;
  event_time: Date;
}

export interface AttendanceSummary {
  employee_id: string;
  total_events: number;
  last_event_time: Date;
}
