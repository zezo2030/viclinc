import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DoctorSchedule, DoctorScheduleSchema } from './schemas/doctor-schedule.schema';
import { Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { DoctorScheduleService } from './services/doctor-schedule.service';
import { AvailabilityService } from './services/availability.service';
import { AppointmentService } from './services/appointment.service';
import { SharedSchemasModule } from '../shared/schemas/schemas.module';
import { RedisModule } from '../shared/redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DoctorSchedule.name, schema: DoctorScheduleSchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    SharedSchemasModule,
    RedisModule,
  ],
  providers: [DoctorScheduleService, AvailabilityService, AppointmentService],
  exports: [DoctorScheduleService, AvailabilityService, AppointmentService],
})
export class ScheduleModule {}
