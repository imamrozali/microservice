import { authService } from "./authService";
import { type AxiosResponse } from "axios";

export interface Employee {
  id: string;
  userId: string;
  fullName: string;
  position: string;
  phoneNumber: string;
  employeeNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeRequest {
  userId: string;
  fullName: string;
  position: string;
  phoneNumber: string;
  employeeNumber: string;
}

export interface UpdateEmployeeRequest {
  fullName?: string;
  position?: string;
  phoneNumber?: string;
  employeeNumber?: string;
}

class EmployeeService {
  private get apiClient() {
    return authService.getApiClient();
  }

  async getEmployees(): Promise<Employee[]> {
    const response: AxiosResponse<Employee[]> =
      await this.apiClient.get("/api/employees");
    return response.data;
  }

  async getEmployee(id: string): Promise<Employee> {
    const response: AxiosResponse<Employee> = await this.apiClient.get(
      `/api/employees/${id}`
    );
    return response.data;
  }

  async createEmployee(data: CreateEmployeeRequest): Promise<Employee> {
    const response: AxiosResponse<Employee> = await this.apiClient.post(
      "/api/employees",
      data
    );
    return response.data;
  }

  async updateEmployee(
    id: string,
    data: UpdateEmployeeRequest
  ): Promise<Employee> {
    const response: AxiosResponse<Employee> = await this.apiClient.put(
      `/api/employees/${id}`,
      data
    );
    return response.data;
  }

  async deleteEmployee(id: string): Promise<void> {
    await this.apiClient.delete(`/api/employees/${id}`);
  }
}

export const employeeService = new EmployeeService();
