import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DepartmentsController } from './departments.controller';
import { PublicDepartmentsController } from './public-departments.controller';
import { DepartmentsService } from './departments.service';
import { Department, DepartmentSchema } from './schemas/department.schema';
import { DoctorProfile, DoctorProfileSchema } from '../doctors/schemas/doctor-profile.schema';
import { Service, ServiceSchema } from '../services/schemas/service.schema';
import { GuardsModule } from '../shared/guards/guards.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Department.name, schema: DepartmentSchema },
      { name: DoctorProfile.name, schema: DoctorProfileSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
    GuardsModule,
  ],
  controllers: [DepartmentsController, PublicDepartmentsController],
  providers: [DepartmentsService],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}
