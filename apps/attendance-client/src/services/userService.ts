import { authService } from "./authService";
import axios, { type AxiosInstance, type AxiosResponse } from "axios";

export interface User {
  photo_url: any;
  id: string;
  email: string;
  role: string;
  full_name?: string;
  job_position?: string;
  phone_number?: string;
  profile_picture?: string;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    fullName: string;
    position: string;
    phoneNumber: string;
    employeeNumber: string;
    profilePicture?: string;
  };
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  job_position?: string;
  phone_number?: string;
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

    // Add auth token to requests
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

  async getCurrentUser(): Promise<User> {
    const userStr = authService.getUsers();
    if (!userStr) throw new Error("User not found in session");
    if (!userStr.id) throw new Error("User ID not found in session");
    const response: AxiosResponse<User> = await this.apiClient.get(
      `/api/users/${userStr.id}`
    );
    return response.data;
  }

  async updatePassword(data: UpdatePasswordRequest): Promise<void> {
    await this.apiClient.put("/api/users/password", data);
  }

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response: AxiosResponse<User> = await this.apiClient.put(
      "/api/users/profile",
      data
    );

    return response.data;
  }

  async uploadProfilePicture(file: File): Promise<{ photo_url: string; fileName: string }> {
    const userStr = authService.getUsers();
    if (!userStr?.id) throw new Error("User ID not found in session");

    const formData = new FormData();
    formData.append("file", file);

    const response: AxiosResponse<{ photo_url: string; fileName: string; message: string }> =
      await this.apiClient.post(`/api/users/${userStr.id}/upload-photo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

    // Update user profile with new photo_url
    await this.apiClient.put("/api/users/profile", {
      photo_url: response.data.photo_url,
    });

    // Update session user with new photo_url
    const updatedUser = { ...userStr, photo_url: response.data.photo_url };
    authService.setUser(updatedUser);

    return {
      photo_url: response.data.photo_url,
      fileName: response.data.fileName,
    };
  }

  async getProfilePhoto(): Promise<{ photo_url: string; fileName: string }> {
    const userStr = authService.getUsers();
    if (!userStr?.id) throw new Error("User ID not found in session");

    const response: AxiosResponse<{ photo_url: string; fileName: string }> =
      await this.apiClient.get(`/api/users/${userStr.id}/photo`);

    return response.data;
  }
}

export const userService = new UserService();
