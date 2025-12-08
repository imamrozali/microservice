import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import type { CreateAttendanceEventDto } from '../dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  async findAll() {
    return await this.attendanceService.findAll();
  }

  @Get('events')
  async getEvents(
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.attendanceService.getAttendanceByDateRange(
      userId,
      startDate,
      endDate,
    );
  }

  @Get('today/:userId')
  async getTodayAttendance(@Param('userId') userId: string) {
    return await this.attendanceService.getTodayAttendance(userId);
  }

  @Get('summary')
  async getSummary(
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    return await this.attendanceService.getAttendanceByDateRange(
      userId,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.attendanceService.findById(id);
  }

  @Get('employee/:employeeId')
  async findByEmployeeId(@Param('employeeId') employeeId: string) {
    return await this.attendanceService.findByEmployeeId(employeeId);
  }

  @Get('employee/:employeeId/range')
  async getEventsByDateRange(
    @Param('employeeId') employeeId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string
  ) {
    return await this.attendanceService.getEventsByDateRange(
      employeeId,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Post('check-in')
  @HttpCode(HttpStatus.CREATED)
  async checkIn(@Body() data: { userId: string; latitude?: number; longitude?: number }) {
    try {
      return await this.attendanceService.checkIn(data.userId, data.latitude, data.longitude);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to check in');
    }
  }

  @Post('check-out')
  @HttpCode(HttpStatus.CREATED)
  async checkOut(@Body() data: { userId: string; latitude?: number; longitude?: number }) {
    return await this.attendanceService.checkOut(data.userId, data.latitude, data.longitude);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() data: CreateAttendanceEventDto) {
    return await this.attendanceService.create(data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.attendanceService.delete(id);
  }
}
