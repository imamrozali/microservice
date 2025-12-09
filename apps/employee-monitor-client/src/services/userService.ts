import { authService } from "./authService.js";
import axios, { type AxiosInstance } from "axios";

export interface User {
  role: any;
  id: string;
  email: string;
  full_name: string;
  job_position: string;
  phone_number?: string;
  profile_picture?: string;
  photo_url?: string; // Presigned URL from MinIO
  role_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  full_name: string;
  job_position: string;
  phone_number?: string;
  photo_url?: string;
  role_id: string;
}

export interface UpdateUserDto {
  email?: string;
  full_name?: string;
  job_position?: string;
  phone_number?: string;
  photo_url?: string;
  role_id?: string;
  is_active?: boolean;
}

class UserService {
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

  async getAllUsers(): Promise<User[]> {
    const response = await this.apiClient.get<User[]>("/api/users");
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await this.apiClient.get<User>(`/api/users/${id}`);
    return response.data;
  }

  async createUser(data: CreateUserDto): Promise<User> {
    const response = await this.apiClient.post<User>("/api/users", data);
    return response.data;
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const response = await this.apiClient.put<User>(`/api/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.apiClient.delete(`/api/users/${id}`);
  }

  async uploadProfilePicture(userId: string, file: File): Promise<{ photo_url: string; fileName: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await this.apiClient.post<{ photo_url: string; fileName: string; message: string }>(
      `/api/users/${userId}/upload-photo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return {
      photo_url: response.data.photo_url,
      fileName: response.data.fileName,
    };
  }

  async getProfilePhoto(userId: string): Promise<{ photo_url: string; fileName: string }> {
    const response = await this.apiClient.get<{ photo_url: string; fileName: string }>(
      `/api/users/${userId}/photo`
    );

    return response.data;
  }
}

export const userService = new UserService();
