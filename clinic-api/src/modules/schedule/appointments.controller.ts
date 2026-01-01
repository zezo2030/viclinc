import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AppointmentService } from './services/appointment.service';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { User } from '../users/schemas/user.schema';

@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({ status: 200, description: 'Appointment retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not authorized to access this appointment' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async getAppointmentById(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    const userId = (user as any).sub || (user as any)._id?.toString();
    const userRole = (user as any).role || 'PATIENT';
    
    return this.appointmentService.getAppointmentById(id, userId, userRole);
  }
}




