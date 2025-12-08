import axios, { type AxiosInstance, AxiosError } from "axios";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    full_name: string;
    role_id: string;
    role_name: string;
    photo_url?: string | null;
  };
}

export interface AuthError {
  message: string;
  statusCode?: number;
}

class AuthService {
  private readonly TOKEN_KEY = "auth_token";
  private readonly REFRESH_TOKEN_KEY = "refresh_token";
  private readonly USER_KEY = "auth_user";
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:3001",
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
      async (error: AxiosError) => {
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
        "/api/auth/login",
        credentials
      );
      const data = response.data;
      this.setToken(data.access_token);
      this.setRefreshToken(data.refresh_token);
      this.setUser(data.user);
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

  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      try {
        await this.apiClient.post("/api/auth/logout", {
          refresh_token: refreshToken,
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getUser(): AuthResponse["user"] | null {
    const data = localStorage.getItem(this.USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  setUser(user: AuthResponse["user"]): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    // Dispatch custom event to notify components about profile update
    window.dispatchEvent(new Event('profileUpdated'));
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role_name === 'Administrator';
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  getApiClient(): AxiosInstance {
    return this.apiClient;
  }
}

export const authService = new AuthService();
