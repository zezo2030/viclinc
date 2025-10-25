import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Department, DepartmentSchema } from '../departments/schemas/department.schema';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { ScheduleModule } from '../schedule/schedule.module';
import { GuardsModule } from '../shared/guards/guards.module';
import { SharedSchemasModule } from '../shared/schemas/schemas.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Department.name, schema: DepartmentSchema },
    ]),
    SharedSchemasModule,
    GuardsModule,
    ScheduleModule,
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
