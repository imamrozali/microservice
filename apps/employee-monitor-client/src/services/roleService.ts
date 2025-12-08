import { authService } from "./authService.js";
import axios, { type AxiosInstance } from "axios";

export interface Role {
  id: string;
  role_name: string;
  created_at: string;
}

class RoleService {
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:3002",
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

  async getAllRoles(): Promise<Role[]> {
    const response = await this.apiClient.get<Role[]>("/api/roles");
    return response.data;
  }
}

export const roleService = new RoleService();
