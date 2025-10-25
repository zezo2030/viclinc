import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DoctorProfile, DoctorProfileSchema } from '../../doctors/schemas/doctor-profile.schema';
import { DoctorService, DoctorServiceSchema } from '../../doctors/schemas/doctor-service.schema';
import { Service, ServiceSchema } from '../../services/schemas/service.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DoctorProfile.name, schema: DoctorProfileSchema },
      { name: DoctorService.name, schema: DoctorServiceSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
  ],
  exports: [
    MongooseModule.forFeature([
      { name: DoctorProfile.name, schema: DoctorProfileSchema },
      { name: DoctorService.name, schema: DoctorServiceSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
  ],
})
export class SharedSchemasModule {}

