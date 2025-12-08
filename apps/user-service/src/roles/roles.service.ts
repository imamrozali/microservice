import { Injectable } from '@nestjs/common';
import { db } from '../database/connection';
import type { Role } from '../entities';
import type { CreateRoleDto, UpdateRoleDto } from '../dto';

@Injectable()
export class RolesService {
  async findAll(): Promise<Role[]> {
    return await db('roles').select('*');
  }

  async findById(id: string): Promise<Role | undefined> {
    return await db('roles').where('id', id).first();
  }

  async findByCode(code: string): Promise<Role | undefined> {
    return await db('roles').where('code', code).first();
  }

  async create(data: CreateRoleDto): Promise<Role> {
    const [role] = await db('roles').insert(data).returning('*');
    return role;
  }

  async update(id: string, data: UpdateRoleDto): Promise<Role | undefined> {
    const [role] = await db('roles')
      .where('id', id)
      .update(data)
      .returning('*');
    return role;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await db('roles').where('id', id).del();
    return deleted > 0;
  }
}
