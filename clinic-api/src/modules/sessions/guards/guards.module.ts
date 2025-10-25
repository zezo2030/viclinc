import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionAccessGuard } from './session-access.guard';
import { DoctorOnlyGuard } from './doctor-only.guard';
import { Appointment, AppointmentSchema } from '../../schedule/schemas/appointment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
  ],
  providers: [SessionAccessGuard, DoctorOnlyGuard],
  exports: [SessionAccessGuard, DoctorOnlyGuard],
})
export class SessionGuardsModule {}
