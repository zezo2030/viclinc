import { Controller, Get, Post, Param, Query, Body, UseGuards, Headers } from '@nestjs/common';
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

@Controller('patient')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly appointmentService: AppointmentService,
  ) {}

  @Get('doctors')
  getDoctors(@Query() filters: DoctorListFilters) {
    return this.patientsService.getDoctors(filters);
  }

  @Get('doctors/:id')
  getDoctorById(@Param('id') id: string) {
    return this.patientsService.getDoctorById(id);
  }

  @Get('doctors/:id/availability')
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
  async createAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @CurrentUser() user: User,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.appointmentService.createAppointment(
      createAppointmentDto,
      (user as any)._id.toString(),
      idempotencyKey,
    );
  }

  @Get('appointments')
  async getMyAppointments(
    @Query() query: AppointmentQueryDto,
    @CurrentUser() user: User,
  ) {
    return this.appointmentService.getPatientAppointments((user as any)._id.toString(), query);
  }

  @Post('appointments/:id/cancel')
  async cancelAppointment(
    @Param('id') appointmentId: string,
    @Body() cancelDto: CancelAppointmentDto,
    @CurrentUser() user: User,
  ) {
    return this.appointmentService.cancelAppointment(appointmentId, (user as any)._id.toString(), cancelDto);
  }

  @Post('appointments/:id/reschedule')
  async rescheduleAppointment(
    @Param('id') appointmentId: string,
    @Body() rescheduleDto: RescheduleAppointmentDto,
    @CurrentUser() user: User,
  ) {
    return this.appointmentService.rescheduleAppointment(appointmentId, (user as any)._id.toString(), rescheduleDto);
  }
}
