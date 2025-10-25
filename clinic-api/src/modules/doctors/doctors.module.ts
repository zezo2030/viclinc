import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DoctorsService } from './doctors.service';
import { DoctorsAdminController } from './doctors-admin.controller';
import { DoctorsController } from './doctors.controller';
import { DoctorProfile, DoctorProfileSchema } from './schemas/doctor-profile.schema';
import { DoctorService, DoctorServiceSchema } from './schemas/doctor-service.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Department, DepartmentSchema } from '../departments/schemas/department.schema';
import { Service, ServiceSchema } from '../services/schemas/service.schema';
import { ScheduleModule } from '../schedule/schedule.module';
import { GuardsModule } from '../shared/guards/guards.module';
import { SharedSchemasModule } from '../shared/schemas/schemas.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Department.name, schema: DepartmentSchema },
    ]),
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET') || 'dev_secret',
        signOptions: { expiresIn: Number(cfg.get('JWT_EXPIRES_SEC') ?? 900) },
      }),
    }),
    SharedSchemasModule,
    GuardsModule,
    ScheduleModule,
  ],
  controllers: [DoctorsAdminController, DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService],
})
export class DoctorsModule {}
