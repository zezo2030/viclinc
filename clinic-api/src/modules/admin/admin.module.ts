import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MetricsService } from './services/metrics.service';
import { UsersManagementService } from './services/users-management.service';
import { ImpersonationService } from './services/impersonation.service';
import { ImportExportService } from './services/import-export.service';
import { ReportsService } from './services/reports.service';
import { AdminAudit, AdminAuditSchema } from './schemas/admin-audit.schema';
import { ImpersonationSession, ImpersonationSessionSchema } from './schemas/impersonation-session.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { DoctorProfile, DoctorProfileSchema } from '../doctors/schemas/doctor-profile.schema';
import { Appointment, AppointmentSchema } from '../schedule/schemas/appointment.schema';
import { Department, DepartmentSchema } from '../departments/schemas/department.schema';
import { Service, ServiceSchema } from '../services/schemas/service.schema';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema';
import { RedisModule } from '../shared/redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminAudit.name, schema: AdminAuditSchema },
      { name: ImpersonationSession.name, schema: ImpersonationSessionSchema },
      { name: User.name, schema: UserSchema },
      { name: DoctorProfile.name, schema: DoctorProfileSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    AuthModule,
    RedisModule,
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    MetricsService,
    UsersManagementService,
    ImpersonationService,
    ImportExportService,
    ReportsService,
  ],
  exports: [
    AdminService,
    MetricsService,
    UsersManagementService,
    ImpersonationService,
    ImportExportService,
    ReportsService,
  ],
})
export class AdminModule {}
