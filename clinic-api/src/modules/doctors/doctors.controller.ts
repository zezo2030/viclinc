import { Controller, Get, Patch, Put, Delete, Param, Body, UseGuards, Req, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { UpdateDoctorServiceDto } from './dto/update-doctor-service.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { DoctorRoleGuard } from '../shared/guards/doctor-role.guard';
import { DoctorScheduleService } from '../schedule/services/doctor-schedule.service';
import { CreateScheduleDto } from '../schedule/dto/create-schedule.dto';
import { UpdateScheduleDto } from '../schedule/dto/update-schedule.dto';
import { AddExceptionDto } from '../schedule/dto/add-exception.dto';
import { AddHolidayDto } from '../schedule/dto/add-holiday.dto';
import { AppointmentService } from '../schedule/services/appointment.service';
import { AppointmentQueryDto } from '../schedule/dto/appointment-query.dto';
import { ConfirmAppointmentDto } from '../schedule/dto/confirm-appointment.dto';
import { RejectAppointmentDto } from '../schedule/dto/reject-appointment.dto';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { User } from '../users/schemas/user.schema';

@ApiTags('Doctors')
@ApiBearerAuth()
@Controller('doctor')
@UseGuards(JwtAuthGuard, DoctorRoleGuard)
export class DoctorsController {
  constructor(
    private readonly doctorsService: DoctorsService,
    private readonly doctorScheduleService: DoctorScheduleService,
    private readonly appointmentService: AppointmentService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current doctor profile' })
  @ApiResponse({ status: 200, description: 'Doctor profile retrieved successfully' })
  getCurrentDoctorProfile(@Req() req: any) {
    return this.doctorsService.getCurrentDoctorProfile(req.user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update doctor profile' })
  @ApiResponse({ status: 200, description: 'Doctor profile updated successfully' })
  updateDoctorProfile(
    @Req() req: any,
    @Body() updateProfileDto: UpdateDoctorProfileDto,
  ) {
    return this.doctorsService.updateDoctorProfile(req.user.sub, updateProfileDto);
  }

  @Get('me/services')
  @ApiOperation({ summary: 'Get doctor services' })
  @ApiResponse({ status: 200, description: 'Doctor services retrieved successfully' })
  getDoctorServices(@Req() req: any) {
    return this.doctorsService.getDoctorServices(req.user.sub);
  }

  @Put('me/services/:serviceId')
  @ApiOperation({ summary: 'Update doctor service' })
  @ApiResponse({ status: 200, description: 'Doctor service updated successfully' })
  updateDoctorService(
    @Req() req: any,
    @Param('serviceId') serviceId: string,
    @Body() updateServiceDto: UpdateDoctorServiceDto,
  ) {
    return this.doctorsService.updateDoctorService(req.user.sub, serviceId, updateServiceDto);
  }

  @Delete('me/services/:serviceId')
  @ApiOperation({ summary: 'Remove doctor service' })
  @ApiResponse({ status: 200, description: 'Doctor service removed successfully' })
  removeDoctorService(
    @Req() req: any,
    @Param('serviceId') serviceId: string,
  ) {
    return this.doctorsService.removeDoctorService(req.user.sub, serviceId);
  }

  // Schedule endpoints
  @Get('schedule')
  @ApiOperation({ summary: 'Get doctor schedule' })
  @ApiResponse({ status: 200, description: 'Doctor schedule retrieved successfully' })
  getSchedule(@Req() req: any) {
    return this.doctorScheduleService.getSchedule(req.user.sub);
  }

  @Post('schedule')
  @ApiOperation({ summary: 'Create or update doctor schedule' })
  @ApiResponse({ status: 201, description: 'Doctor schedule created/updated successfully' })
  createOrUpdateSchedule(
    @Req() req: any,
    @Body() createScheduleDto: CreateScheduleDto,
  ) {
    return this.doctorScheduleService.createOrUpdateSchedule(req.user.sub, createScheduleDto);
  }

  @Patch('schedule')
  @ApiOperation({ summary: 'Update doctor schedule' })
  @ApiResponse({ status: 200, description: 'Doctor schedule updated successfully' })
  updateSchedule(
    @Req() req: any,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.doctorScheduleService.updateSchedule(req.user.sub, updateScheduleDto);
  }

  @Post('schedule/exceptions')
  @ApiOperation({ summary: 'Add schedule exception' })
  @ApiResponse({ status: 201, description: 'Schedule exception added successfully' })
  addException(
    @Req() req: any,
    @Body() addExceptionDto: AddExceptionDto,
  ) {
    return this.doctorScheduleService.addException(req.user.sub, addExceptionDto);
  }

  @Delete('schedule/exceptions/:date')
  @ApiOperation({ summary: 'Remove schedule exception' })
  @ApiResponse({ status: 200, description: 'Schedule exception removed successfully' })
  removeException(
    @Req() req: any,
    @Param('date') date: string,
  ) {
    return this.doctorScheduleService.removeException(req.user.sub, date);
  }

  @Post('schedule/holidays')
  @ApiOperation({ summary: 'Add holiday' })
  @ApiResponse({ status: 201, description: 'Holiday added successfully' })
  addHoliday(
    @Req() req: any,
    @Body() addHolidayDto: AddHolidayDto,
  ) {
    return this.doctorScheduleService.addHoliday(req.user.sub, addHolidayDto);
  }

  @Delete('schedule/holidays/:holidayId')
  @ApiOperation({ summary: 'Remove holiday' })
  @ApiResponse({ status: 200, description: 'Holiday removed successfully' })
  removeHoliday(
    @Req() req: any,
    @Param('holidayId') holidayId: string,
  ) {
    return this.doctorScheduleService.removeHoliday(req.user.sub, holidayId);
  }

  // Appointment endpoints
  @Get('appointments')
  @ApiOperation({ summary: 'Get doctor appointments' })
  @ApiResponse({ status: 200, description: 'Doctor appointments retrieved successfully' })
  async getMyAppointments(
    @Query() query: AppointmentQueryDto,
    @CurrentUser() user: User,
  ) {
    return this.appointmentService.getDoctorAppointments((user as any)._id.toString(), query);
  }

  @Post('appointments/:id/confirm')
  @ApiOperation({ summary: 'Confirm appointment' })
  @ApiResponse({ status: 200, description: 'Appointment confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot confirm appointment' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your appointment' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async confirmAppointment(
    @Param('id') appointmentId: string,
    @Body() confirmDto: ConfirmAppointmentDto,
    @CurrentUser() user: User,
  ) {
    return this.appointmentService.confirmAppointment(
      appointmentId,
      (user as any)._id.toString(),
      confirmDto,
    );
  }

  @Post('appointments/:id/reject')
  @ApiOperation({ summary: 'Reject appointment' })
  @ApiResponse({ status: 200, description: 'Appointment rejected successfully' })
  @ApiResponse({ status: 400, description: 'Cannot reject appointment' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your appointment' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async rejectAppointment(
    @Param('id') appointmentId: string,
    @Body() rejectDto: RejectAppointmentDto,
    @CurrentUser() user: User,
  ) {
    return this.appointmentService.rejectAppointment(
      appointmentId,
      (user as any)._id.toString(),
      rejectDto,
    );
  }
}
