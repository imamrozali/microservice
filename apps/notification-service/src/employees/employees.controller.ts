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
import { EmployeesService } from './employees.service';
import type {
  CreateEmployeeProfileDto,
  UpdateEmployeeProfileDto,
} from '../dto';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async findAll() {
    return await this.employeesService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.employeesService.findById(id);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return await this.employeesService.findByUserId(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() data: CreateEmployeeProfileDto) {
    return await this.employeesService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateEmployeeProfileDto
  ) {
    return await this.employeesService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.employeesService.delete(id);
  }
}
