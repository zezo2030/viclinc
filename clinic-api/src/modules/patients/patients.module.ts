import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Department, DepartmentSchema } from '../departments/schemas/department.schema';
import { ChatSession, ChatSessionSchema } from '../sessions/schemas/chat-session.schema';
import { VideoSession, VideoSessionSchema } from '../sessions/schemas/video-session.schema';
import { Appointment, AppointmentSchema } from '../schedule/schemas/appointment.schema';
import { PatientsController } from './patients.controller';
import { ConsultationsController, ConsultationsService } from './consultations.controller';
import { PatientsService } from './patients.service';
import { ScheduleModule } from '../schedule/schedule.module';
import { GuardsModule } from '../shared/guards/guards.module';
import { SharedSchemasModule } from '../shared/schemas/schemas.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Department.name, schema: DepartmentSchema },
      { name: ChatSession.name, schema: ChatSessionSchema },
      { name: VideoSession.name, schema: VideoSessionSchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    SharedSchemasModule,
    GuardsModule,
    ScheduleModule,
  ],
  controllers: [PatientsController, ConsultationsController],
  providers: [PatientsService, ConsultationsService],
  exports: [PatientsService],
})
export class PatientsModule {}
