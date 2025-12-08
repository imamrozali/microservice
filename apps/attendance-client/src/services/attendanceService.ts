import { authService } from "./authService";
import axios, { type AxiosInstance, type AxiosResponse } from "axios";

export interface AttendanceEvent {
  id: string;
  userId: string;
  eventType: "check-in" | "check-out";
  timestamp: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export interface CheckInRequest {
  latitude?: number;
  longitude?: number;
}

export interface CheckOutRequest {
  latitude?: number;
  longitude?: number;
}

export interface AttendanceSummary {
  userId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  totalHours?: number;
  status: "present" | "absent" | "partial";
}

class AttendanceService {
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: import.meta.env.VITE_ATTENDANCE_SERVICE_URL || "http://localhost:3003",
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

  async checkIn(data: CheckInRequest): Promise<AttendanceEvent> {
    const user = authService.getUsers();
    if (!user?.id) throw new Error("User not authenticated");

    const response: AxiosResponse<AttendanceEvent> = await this.apiClient.post(
      "/api/attendance/check-in",
      {
        userId: user.id,
        ...data,
      }
    );
    return response.data;
  }

  async checkOut(data: CheckOutRequest): Promise<AttendanceEvent> {
    const user = authService.getUsers();
    if (!user?.id) throw new Error("User not authenticated");

    const response: AxiosResponse<AttendanceEvent> = await this.apiClient.post(
      "/api/attendance/check-out",
      {
        userId: user.id,
        ...data,
      }
    );
    return response.data;
  }

  async getAttendanceEvents(
    startDate?: string,
    endDate?: string
  ): Promise<AttendanceEvent[]> {
    const user = authService.getUsers();
    if (!user?.id) throw new Error("User not authenticated");

    const params = new URLSearchParams();
    params.append("userId", user.id);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response: AxiosResponse<AttendanceEvent[]> = await this.apiClient.get(
      `/api/attendance/events?${params}`
    );
    return response.data;
  }

  async getTodayAttendance(): Promise<any> {
    const user = authService.getUsers();
    if (!user?.id) throw new Error("User not authenticated");

    const response: AxiosResponse<any> = await this.apiClient.get(
      `/api/attendance/today/${user.id}`
    );
    return response.data;
  }

  async getAttendanceSummary(
    startDate?: string,
    endDate?: string
  ): Promise<AttendanceSummary[]> {
    const user = authService.getUsers();
    if (!user?.id) throw new Error("User not authenticated");

    const params = new URLSearchParams();
    params.append("employee_id", user.id);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response: AxiosResponse<AttendanceSummary[]> =
      await this.apiClient.get(`/api/attendance/summary?${params}`);
    return response.data;
  }
}

export const attendanceService = new AttendanceService();
