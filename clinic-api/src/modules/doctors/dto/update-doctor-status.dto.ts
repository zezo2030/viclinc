import { IsEnum } from 'class-validator';
import { DoctorStatus } from '../schemas/doctor-profile.schema';

export class UpdateDoctorStatusDto {
  @IsEnum(DoctorStatus)
  status: DoctorStatus;
}
