import { Controller, Get, Post, Param, Query, Body, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { CreateAppointmentDto } from '../schedule/dto/create-appointment.dto';
import { CancelAppointmentDto } from '../schedule/dto/cancel-appointment.dto';
import { RescheduleAppointmentDto } from '../schedule/dto/reschedule-appointment.dto';
import { AppointmentQueryDto } from '../schedule/dto/appointment-query.dto';
import { AppointmentService } from '../schedule/services/appointment.service';
import type { DoctorListFilters } from './patients.service';
import { User } from '../users/schemas/user.schema';

@ApiTags('Patients')
@ApiBearerAuth()
@Controller('patient')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly appointmentService: AppointmentService,
  ) {}

  @Get('doctors')
  @ApiOperation({ summary: 'Get list of doctors with filters' })
  @ApiResponse({ status: 200, description: 'Doctors list retrieved successfully' })
  getDoctors(@Query() filters: DoctorListFilters) {
    return this.patientsService.getDoctors(filters);
  }

  @Get('doctors/:id')
  @ApiOperation({ summary: 'Get doctor details by ID' })
  @ApiParam({ name: 'id', description: 'Doctor ID' })
  @ApiResponse({ status: 200, description: 'Doctor details retrieved successfully' })
  getDoctorById(@Param('id') id: string) {
    return this.patientsService.getDoctorById(id);
  }

  @Get('doctors/:id/availability')
  @ApiOperation({ summary: 'Get doctor availability for appointments' })
  @ApiParam({ name: 'id', description: 'Doctor ID' })
  @ApiQuery({ name: 'serviceId', required: true, description: 'Service ID' })
  @ApiQuery({ name: 'weekStart', required: false, description: 'Week start date (optional)' })
  @ApiResponse({ status: 200, description: 'Doctor availability retrieved successfully' })
  getDoctorAvailability(
    @Param('id') doctorId: string,
    @Query('serviceId') serviceId: string,
    @Query('weekStart') weekStart?: string,
  ) {
    if (!serviceId) {
      throw new Error('serviceId is required');
    }
    
    return this.patientsService.getDoctorAvailability(doctorId, serviceId, weekStart);
  }

  @Post('appointments')
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  async createAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @CurrentUser() user: User,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.appointmentService.createAppointment(
      createAppointmentDto,
      (user as any).sub || (user as any)._id?.toString(),
      idempotencyKey,
    );
  }

  @Get('appointments')
  @ApiOperation({ summary: 'Get patient appointments' })
  @ApiResponse({ status: 200, description: 'Appointments retrieved successfully' })
  async getMyAppointments(
    @Query() query: AppointmentQueryDto,
    @CurrentUser() user: User,
  ) {
    const userId = (user as any).sub || (user as any)._id?.toString();
    return this.appointmentService.getPatientAppointments(userId, query);
  }

  @Post('appointments/:id/cancel')
  @ApiOperation({ summary: 'Cancel an appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({ status: 200, description: 'Appointment cancelled successfully' })
  async cancelAppointment(
    @Param('id') appointmentId: string,
    @Body() cancelDto: CancelAppointmentDto,
    @CurrentUser() user: User,
  ) {
    const userId = (user as any).sub || (user as any)._id?.toString();
    return this.appointmentService.cancelAppointment(appointmentId, userId, cancelDto);
  }

  @Post('appointments/:id/reschedule')
  @ApiOperation({ summary: 'Reschedule an appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({ status: 200, description: 'Appointment rescheduled successfully' })
  async rescheduleAppointment(
    @Param('id') appointmentId: string,
    @Body() rescheduleDto: RescheduleAppointmentDto,
    @CurrentUser() user: User,
  ) {
    const userId = (user as any).sub || (user as any)._id?.toString();
    return this.appointmentService.rescheduleAppointment(appointmentId, userId, rescheduleDto);
  }
}
