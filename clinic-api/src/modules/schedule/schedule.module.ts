import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DoctorSchedule, DoctorScheduleSchema } from './schemas/doctor-schedule.schema';
import { Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { DoctorScheduleService } from './services/doctor-schedule.service';
import { AvailabilityService } from './services/availability.service';
import { AppointmentService } from './services/appointment.service';
import { AppointmentsController } from './appointments.controller';
import { SharedSchemasModule } from '../shared/schemas/schemas.module';
import { RedisModule } from '../shared/redis/redis.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { GuardsModule } from '../shared/guards/guards.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DoctorSchedule.name, schema: DoctorScheduleSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: User.name, schema: UserSchema },
    ]),
    SharedSchemasModule,
    RedisModule,
    NotificationsModule,
    GuardsModule,
  ],
  controllers: [AppointmentsController],
  providers: [DoctorScheduleService, AvailabilityService, AppointmentService],
  exports: [DoctorScheduleService, AvailabilityService, AppointmentService],
})
export class ScheduleModule {}
