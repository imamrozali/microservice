import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import type { CreateRoleDto, UpdateRoleDto } from '../dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async findAll() {
    return await this.rolesService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.rolesService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() data: CreateRoleDto) {
    return await this.rolesService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateRoleDto) {
    return await this.rolesService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.rolesService.delete(id);
  }
}
