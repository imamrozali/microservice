import { authService } from "./authService";
import { type AxiosResponse } from "axios";

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
  private get apiClient() {
    return authService.getApiClient();
  }

  async checkIn(data: CheckInRequest): Promise<AttendanceEvent> {
    const response: AxiosResponse<AttendanceEvent> = await this.apiClient.post(
      "/attendance/check-in",
      data
    );
    return response.data;
  }

  async checkOut(data: CheckOutRequest): Promise<AttendanceEvent> {
    const response: AxiosResponse<AttendanceEvent> = await this.apiClient.post(
      "/attendance/check-out",
      data
    );
    return response.data;
  }

  async getAttendanceEvents(
    startDate?: string,
    endDate?: string
  ): Promise<AttendanceEvent[]> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response: AxiosResponse<AttendanceEvent[]> = await this.apiClient.get(
      `/attendance/events?${params}`
    );
    return response.data;
  }

  async getAttendanceSummary(
    startDate?: string,
    endDate?: string
  ): Promise<AttendanceSummary[]> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response: AxiosResponse<AttendanceSummary[]> =
      await this.apiClient.get(`/attendance/summary?${params}`);
    return response.data;
  }
}

export const attendanceService = new AttendanceService();
