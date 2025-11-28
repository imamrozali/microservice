import axios, { type AxiosInstance, AxiosError } from "axios";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface AuthError {
  message: string;
  statusCode?: number;
}

class AuthService {
  private readonly TOKEN_KEY = "auth_token";
  private readonly USERS_KEY = "auth_users";
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: import.meta.env.VITE_AUTH_SERVICE_URL || "",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.apiClient.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.apiClient.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.apiClient.post<AuthResponse>(
        "/auth/login",
        credentials
      );
      const data = response.data;
      this.setToken(data.access_token);
      this.setUsers(JSON.stringify(data.user));
      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Invalid email or password";
        throw new Error(message);
      }
      throw new Error("Network error. Please try again.");
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USERS_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUsers(): Record<string, string> | null {
    const data = localStorage.getItem(this.USERS_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  setUsers(users: string): void {
    localStorage.setItem(this.USERS_KEY, users);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Get the configured axios instance for other API calls
  getApiClient(): AxiosInstance {
    return this.apiClient;
  }
}

export const authService = new AuthService();
