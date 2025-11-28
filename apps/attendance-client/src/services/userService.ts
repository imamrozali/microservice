import { authService } from "./authService";
import { type AxiosResponse } from "axios";

export interface User {
  id: string;
  email: string;
  role: string;
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
  phoneNumber?: string;
  profilePicture?: File;
}

class UserService {
  private get apiClient() {
    return authService.getApiClient();
  }

  async getCurrentUser(): Promise<User> {
    const userStr = authService.getUsers();
    if (!userStr) throw new Error("User not found in session");
    if (!userStr.id) throw new Error("User ID not found in session");
    const response: AxiosResponse<User> = await this.apiClient.get(
      `/users/${userStr.id}`
    );
    return response.data;
  }

  async updatePassword(data: UpdatePasswordRequest): Promise<void> {
    await this.apiClient.put("/users/password", data);
  }

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const formData = new FormData();

    if (data.phoneNumber) {
      formData.append("phoneNumber", data.phoneNumber);
    }

    if (data.profilePicture) {
      formData.append("profilePicture", data.profilePicture);
    }

    const response: AxiosResponse<User> = await this.apiClient.put(
      "/users/profile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  }

  async uploadProfilePicture(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("profilePicture", file);

    const response: AxiosResponse<{ profilePicture: string }> =
      await this.apiClient.post("/users/profile-picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

    return response.data.profilePicture;
  }
}

export const userService = new UserService();
