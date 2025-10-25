import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { I18nModule, AcceptLanguageResolver } from 'nestjs-i18n';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { HealthController } from './health.controller';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { PatientsModule } from './modules/patients/patients.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { SettingsModule } from './modules/settings/settings.module';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { MongooseModule as Feature } from '@nestjs/mongoose';
import { Department, DepartmentSchema } from './modules/departments/schemas/department.schema';
import { Service as Svc, ServiceSchema } from './modules/services/schemas/service.schema';
import { DepartmentsService } from './modules/departments/departments.service';
import { DepartmentsController } from './modules/departments/departments.controller';
import { ServicesService } from './modules/services/services.service';
import { ServicesController } from './modules/services/services.controller';
import { RedisModule } from './modules/shared/redis/redis.module';

const isProd = process.env.NODE_ENV === 'production';
const i18nPath = isProd
  ? join(process.cwd(), 'dist', 'src', 'i18n')
  : join(process.cwd(), 'src', 'i18n');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    I18nModule.forRoot({
      fallbackLanguage: 'ar',
      loaderOptions: { path: i18nPath, watch: !isProd },
      resolvers: [AcceptLanguageResolver],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI') || 'mongodb://localhost:27017/clinic',
      }),
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests per minute
      },
    ]),
    RedisModule,
    UsersModule,
    AuthModule,
    DoctorsModule,
    ScheduleModule,
    PatientsModule,
    PaymentsModule,
    SessionsModule,
    SettingsModule,
    MedicalRecordsModule,
    Feature.forFeature([
      { name: Department.name, schema: DepartmentSchema },
      { name: Svc.name, schema: ServiceSchema },
    ]),
  ],
  controllers: [AppController, HealthController, DepartmentsController, ServicesController],
  providers: [AppService, DepartmentsService, ServicesService],
})
export class AppModule {}
