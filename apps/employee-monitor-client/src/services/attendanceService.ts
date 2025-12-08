import { authService } from "./authService.js";
import axios, { type AxiosInstance } from "axios";

export interface AttendanceEvent {
  id: number;
  user_id: number;
  event_type: "check-in" | "check-out" | "break-start" | "break-end";
  timestamp: string;
  location?: string;
  notes?: string;
  photo_url?: string;
  created_at: string;
}

export interface AttendanceSummary {
  user_id: number;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  latitude?: string;
  longitude?: string;
  status: string
  user?: {
    id: number;
    email: string;
    full_name: string;
    job_position: string;
  };
}

export interface AttendanceFilters {
  userId?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
}

class AttendanceService {
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL:
        import.meta.env.VITE_ATTENDANCE_SERVICE_URL || "http://localhost:3003",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.apiClient.interceptors.request.use(
      (config) => {
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  async getAllAttendance(filters?: AttendanceFilters): Promise<AttendanceSummary[]> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append("userId", filters.userId.toString());
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.status) params.append("status", filters.status);

    const response = await this.apiClient.get<AttendanceSummary[]>(
      `/api/attendance/summary?${params.toString()}`
    );
    return response.data;
  }

  async getAttendanceEvents(
    userId: number,
    date: string
  ): Promise<AttendanceEvent[]> {
    const response = await this.apiClient.get<AttendanceEvent[]>(
      `/api/attendance/events?userId=${userId}&date=${date}`
    );
    return response.data;
  }
}

export const attendanceService = new AttendanceService();
