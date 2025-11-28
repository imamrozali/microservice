import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AttendanceService } from "./attendance.service";
import { AuditService } from "../audit/audit.service";

@ApiTags("attendance")
@Controller("attendance")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
export class AttendanceController {
  constructor(
    private attendanceService: AttendanceService,
    private auditService: AuditService
  ) {}

  @Post("check-in")
  @ApiOperation({ summary: "Check in attendance" })
  checkIn(
    @Request() req,
    @Body()
    body: {
      latitude?: number;
      longitude?: number;
    }
  ) {
    return this.attendanceService.checkIn(req.user.userId, {
      ...body,
      agent: req.headers["user-agent"],
    });
  }

  @Post("check-out")
  @ApiOperation({ summary: "Check out attendance" })
  checkOut(
    @Request() req,
    @Body()
    body: {
      latitude?: number;
      longitude?: number;
    }
  ) {
    return this.attendanceService.checkOut(req.user.userId, {
      ...body,
      agent: req.headers["user-agent"],
    });
  }

  @Get("summary")
  @ApiOperation({ summary: "Get attendance summary" })
  async getSummary(
    @Request() req,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string
  ) {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Log attendance summary access
    await this.auditService.createUserAuditLog(
      req.user.userId,
      "attendance-service",
      "UPDATE",
      {
        action: "attendance_summary_accessed",
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        accessed_at: new Date().toISOString(),
      }
    );

    return this.attendanceService.getAttendanceSummary(
      req.user.userId,
      start,
      end
    );
  }

  @Get("events")
  @ApiOperation({ summary: "Get attendance events" })
  getEvents(@Request() req, @Query("date") date?: string) {
    const eventDate = date ? new Date(date) : undefined;
    return this.attendanceService.getAttendanceEvents(
      req.user.userId,
      eventDate
    );
  }

  @Get("employees-absent")
  @ApiOperation({ summary: "Get employees without check-in today" })
  async getAbsentEmployees(@Request() req, @Query("date") date?: string) {
    const checkDate = date ? new Date(date) : new Date();

    // Log access to absent employees report
    await this.auditService.createUserAuditLog(
      req.user.userId,
      "attendance-service",
      "UPDATE",
      {
        action: "absent_employees_report_accessed",
        check_date: checkDate.toISOString(),
        accessed_by: req.user.email,
        accessed_at: new Date().toISOString(),
      }
    );

    return this.attendanceService.getEmployeesWithoutCheckIn(checkDate);
  }
}
