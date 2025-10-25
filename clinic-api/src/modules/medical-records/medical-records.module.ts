import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicalRecordsService } from './medical-records.service';
import { DoctorMedicalRecordsController } from './controllers/doctor-medical-records.controller';
import { PatientMedicalRecordsController } from './controllers/patient-medical-records.controller';
import { AdminMedicalRecordsController } from './controllers/admin-medical-records.controller';
import { MedicalRecord, MedicalRecordSchema } from './schemas/medical-record.schema';
import { MedicalRecordAudit, MedicalRecordAuditSchema } from './schemas/medical-record-audit.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Appointment, AppointmentSchema } from '../schedule/schemas/appointment.schema';
import { GuardsModule } from '../shared/guards/guards.module';
import { SharedSchemasModule } from '../shared/schemas/schemas.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MedicalRecord.name, schema: MedicalRecordSchema },
      { name: MedicalRecordAudit.name, schema: MedicalRecordAuditSchema },
      { name: User.name, schema: UserSchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    GuardsModule,
    SharedSchemasModule,
  ],
  controllers: [
    DoctorMedicalRecordsController,
    PatientMedicalRecordsController,
    AdminMedicalRecordsController,
  ],
  providers: [MedicalRecordsService],
  exports: [MedicalRecordsService],
})
export class MedicalRecordsModule {}
