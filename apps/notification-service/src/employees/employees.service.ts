import { Injectable } from '@nestjs/common';
import { dbMain } from '../database/connection';
import type { EmployeeProfile } from '../entities';
import type {
  CreateEmployeeProfileDto,
  UpdateEmployeeProfileDto,
} from '../dto';

@Injectable()
export class EmployeesService {
  async findAll(): Promise<EmployeeProfile[]> {
    return await dbMain('employee_profiles').select('*');
  }

  async findById(id: string): Promise<EmployeeProfile | undefined> {
    return await dbMain('employee_profiles').where('id', id).first();
  }

  async findByUserId(userId: string): Promise<EmployeeProfile | undefined> {
    return await dbMain('employee_profiles').where('user_id', userId).first();
  }

  async create(data: CreateEmployeeProfileDto): Promise<EmployeeProfile> {
    const [profile] = await dbMain('employee_profiles')
      .insert(data)
      .returning('*');
    return profile;
  }

  async update(
    id: string,
    data: UpdateEmployeeProfileDto
  ): Promise<EmployeeProfile | undefined> {
    const [profile] = await dbMain('employee_profiles')
      .where('id', id)
      .update(data)
      .returning('*');
    return profile;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await dbMain('employee_profiles').where('id', id).del();
    return deleted > 0;
  }
}
