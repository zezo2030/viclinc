import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { MetricsService } from './services/metrics.service';
import { UsersManagementService } from './services/users-management.service';
import { ImpersonationService } from './services/impersonation.service';
import { ImportExportService } from './services/import-export.service';
import { ReportsService } from './services/reports.service';
import { AdminRoleGuard } from '../shared/guards/admin-role.guard';
import { MetricsQueryDto } from './dto/metrics-query.dto';
import { LoginAsDto } from './dto/login-as.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { ImportDataDto } from './dto/import-data.dto';
import { AdminAppointmentQueryDto } from './dto/admin-appointment-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import type { Response } from 'express';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AdminRoleGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly metricsService: MetricsService,
    private readonly usersManagementService: UsersManagementService,
    private readonly impersonationService: ImpersonationService,
    private readonly importExportService: ImportExportService,
    private readonly reportsService: ReportsService,
  ) {}

  // Metrics Endpoints
  @Get('metrics/overview')
  @ApiOperation({ summary: 'Get overview metrics' })
  @ApiResponse({ status: 200, description: 'Overview metrics retrieved successfully' })
  async getOverviewMetrics(@Query() query: MetricsQueryDto) {
    return this.metricsService.getOverviewMetrics(query);
  }

  @Get('metrics/appointments')
  @ApiOperation({ summary: 'Get appointment metrics' })
  @ApiResponse({ status: 200, description: 'Appointment metrics retrieved successfully' })
  async getAppointmentMetrics(@Query() query: MetricsQueryDto) {
    return this.metricsService.getAppointmentMetrics(query);
  }

  @Get('metrics/doctors')
  @ApiOperation({ summary: 'Get doctor metrics' })
  @ApiResponse({ status: 200, description: 'Doctor metrics retrieved successfully' })
  async getDoctorMetrics(@Query() query: MetricsQueryDto) {
    return this.metricsService.getDoctorMetrics(query);
  }

  @Get('metrics/patients')
  @ApiOperation({ summary: 'Get patient metrics' })
  @ApiResponse({ status: 200, description: 'Patient metrics retrieved successfully' })
  async getPatientMetrics(@Query() query: MetricsQueryDto) {
    return this.metricsService.getPatientMetrics(query);
  }

  @Get('metrics/revenue')
  @ApiOperation({ summary: 'Get revenue metrics' })
  @ApiResponse({ status: 200, description: 'Revenue metrics retrieved successfully' })
  async getRevenueMetrics(@Query() query: MetricsQueryDto) {
    return this.metricsService.getRevenueMetrics(query);
  }

  // Users Management Endpoints
  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsers(@Query() query: any) {
    return this.usersManagementService.getAllUsers(query);
  }

  @Post('users')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersManagementService.createUser(createUserDto);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  async updateUserRole(@Param('id') id: string, @Body() updateRoleDto: UpdateUserRoleDto) {
    return this.usersManagementService.updateUserRole(id, updateRoleDto);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Update user status' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  async updateUserStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateUserStatusDto) {
    return this.usersManagementService.updateUserStatus(id, updateStatusDto);
  }

  // Impersonation Endpoints
  @Post('login-as')
  @ApiOperation({ summary: 'Login as another user' })
  @ApiResponse({ status: 200, description: 'Impersonation session created successfully' })
  async loginAs(@Body() loginAsDto: LoginAsDto, @Req() req: any) {
    return this.impersonationService.createImpersonationSession(
      req.user.sub,
      loginAsDto.userId,
      req.ip
    );
  }

  @Post('logout-as')
  @ApiOperation({ summary: 'End impersonation session' })
  @ApiResponse({ status: 200, description: 'Impersonation session ended successfully' })
  async logoutAs(@Req() req: any) {
    return this.impersonationService.endImpersonationSession(req.user.sub);
  }

  // Import/Export Endpoints
  @Post('departments/import')
  @ApiOperation({ summary: 'Import departments' })
  @ApiResponse({ status: 200, description: 'Departments imported successfully' })
  async importDepartments(@Body() importDataDto: ImportDataDto, @Req() req: any) {
    const adminId = req.user?.sub;
    return this.importExportService.importDepartments(importDataDto, adminId);
  }

  @Get('departments/export')
  @ApiOperation({ summary: 'Export departments' })
  @ApiQuery({ name: 'format', enum: ['json', 'csv'], required: false })
  @ApiResponse({ status: 200, description: 'Departments exported successfully' })
  async exportDepartments(@Query('format') format: string = 'json', @Res() res: Response) {
    const result = await this.importExportService.exportDepartments(format);
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="departments.csv"');
      return res.send(result);
    }
    
    return res.json(result);
  }

  @Post('services/import')
  @ApiOperation({ summary: 'Import services' })
  @ApiResponse({ status: 200, description: 'Services imported successfully' })
  async importServices(@Body() importDataDto: ImportDataDto, @Req() req: any) {
    const adminId = req.user?.sub;
    return this.importExportService.importServices(importDataDto, adminId);
  }

  @Get('services/export')
  @ApiOperation({ summary: 'Export services' })
  @ApiQuery({ name: 'format', enum: ['json', 'csv'], required: false })
  @ApiResponse({ status: 200, description: 'Services exported successfully' })
  async exportServices(@Query('format') format: string = 'json', @Res() res: Response) {
    const result = await this.importExportService.exportServices(format);
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="services.csv"');
      return res.send(result);
    }
    
    return res.json(result);
  }

  // Doctors Management Endpoints
  @Get('doctors')
  @ApiOperation({ summary: 'Get all doctors' })
  @ApiResponse({ status: 200, description: 'Doctors retrieved successfully' })
  async getDoctors(@Query() query: any) {
    return this.adminService.getDoctors(query);
  }

  @Patch('doctors/:id/status')
  @ApiOperation({ summary: 'Update doctor status' })
  @ApiResponse({ status: 200, description: 'Doctor status updated successfully' })
  async updateDoctorStatus(@Param('id') id: string, @Body() updateStatusDto: any) {
    return this.adminService.updateDoctorStatus(id, updateStatusDto);
  }

  @Get('doctors/:id/schedule')
  @ApiOperation({ summary: 'Get doctor schedule' })
  @ApiResponse({ status: 200, description: 'Doctor schedule retrieved successfully' })
  async getDoctorSchedule(@Param('id') id: string) {
    return this.adminService.getDoctorSchedule(id);
  }

  @Get('doctors/:id/appointments')
  @ApiOperation({ summary: 'Get doctor appointments' })
  @ApiResponse({ status: 200, description: 'Doctor appointments retrieved successfully' })
  async getDoctorAppointments(@Param('id') id: string, @Query() query: any) {
    return this.adminService.getDoctorAppointments(id, query);
  }

  // Appointments Management Endpoints
  @Get('appointments')
  @ApiOperation({ summary: 'Get all appointments' })
  @ApiResponse({ status: 200, description: 'Appointments retrieved successfully' })
  async getAppointments(@Query() query: AdminAppointmentQueryDto) {
    return this.adminService.getAppointments(query);
  }

  @Patch('appointments/:id/status')
  @ApiOperation({ summary: 'Update appointment status' })
  @ApiResponse({ status: 200, description: 'Appointment status updated successfully' })
  async updateAppointmentStatus(@Param('id') id: string, @Body() updateStatusDto: any) {
    return this.adminService.updateAppointmentStatus(id, updateStatusDto);
  }

  @Get('appointments/conflicts')
  @ApiOperation({ summary: 'Get appointment conflicts' })
  @ApiResponse({ status: 200, description: 'Appointment conflicts retrieved successfully' })
  async getAppointmentConflicts() {
    return this.adminService.getAppointmentConflicts();
  }

  // Reports Endpoints
  @Get('reports/daily')
  @ApiOperation({ summary: 'Get daily report' })
  @ApiResponse({ status: 200, description: 'Daily report retrieved successfully' })
  async getDailyReport(@Query('date') date: string) {
    return this.reportsService.getDailyReport(date);
  }

  @Get('reports/weekly')
  @ApiOperation({ summary: 'Get weekly report' })
  @ApiResponse({ status: 200, description: 'Weekly report retrieved successfully' })
  async getWeeklyReport(@Query('weekStart') weekStart: string) {
    return this.reportsService.getWeeklyReport(weekStart);
  }

  @Get('reports/monthly')
  @ApiOperation({ summary: 'Get monthly report' })
  @ApiResponse({ status: 200, description: 'Monthly report retrieved successfully' })
  async getMonthlyReport(@Query('month') month: string) {
    return this.reportsService.getMonthlyReport(month);
  }

  @Get('reports/doctors-performance')
  @ApiOperation({ summary: 'Get doctors performance report' })
  @ApiResponse({ status: 200, description: 'Doctors performance report retrieved successfully' })
  async getDoctorsPerformanceReport(@Query() query: any) {
    return this.reportsService.getDoctorsPerformanceReport(query);
  }

  // System Endpoints
  @Get('system/health')
  @ApiOperation({ summary: 'Get system health' })
  @ApiResponse({ status: 200, description: 'System health retrieved successfully' })
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  @Get('system/logs')
  @ApiOperation({ summary: 'Get system logs' })
  @ApiResponse({ status: 200, description: 'System logs retrieved successfully' })
  async getSystemLogs(@Query() query: any) {
    return this.adminService.getSystemLogs(query);
  }

  @Post('system/backup')
  @ApiOperation({ summary: 'Create system backup' })
  @ApiResponse({ status: 200, description: 'System backup created successfully' })
  async createBackup() {
    return this.adminService.createBackup();
  }

  @Get('system/audit')
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  async getAuditLogs(@Query() query: any) {
    return this.adminService.getAuditLogs(query);
  }
}
