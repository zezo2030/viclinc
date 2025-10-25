import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsArray, ValidateNested, IsMongoId, MaxLength, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PrescriptionItemDto {
  @ApiProperty({ description: 'Medication name', example: 'Lisinopril' })
  @IsString()
  medication: string;

  @ApiProperty({ description: 'Dosage', example: '10mg' })
  @IsString()
  dosage: string;

  @ApiProperty({ description: 'Duration', example: '30 days' })
  @IsString()
  duration: string;

  @ApiProperty({ description: 'Instructions', example: 'Take once daily with food', required: false })
  @IsOptional()
  @IsString()
  instructions?: string;
}

export class AttachmentDto {
  @ApiProperty({ description: 'File type', example: 'image' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'File URL', example: 'https://example.com/files/xray.jpg' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'File name', example: 'xray.jpg' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'File size in bytes', example: 1024000, required: false })
  @IsOptional()
  @IsNumber()
  size?: number;
}

export class VitalSignsDto {
  @ApiProperty({ description: 'Blood pressure', example: '120/80', required: false })
  @IsOptional()
  @IsString()
  bloodPressure?: string;

  @ApiProperty({ description: 'Temperature in Celsius', example: 36.5, required: false })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiProperty({ description: 'Heart rate (BPM)', example: 72, required: false })
  @IsOptional()
  @IsNumber()
  heartRate?: number;

  @ApiProperty({ description: 'Weight in kg', example: 70, required: false })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({ description: 'Height in cm', example: 175, required: false })
  @IsOptional()
  @IsNumber()
  height?: number;
}

export class CreateMedicalRecordDto {
  @ApiProperty({ description: 'Patient user ID', example: '64f1a2b3c4d5e6f7g8h9i0j1' })
  @IsMongoId()
  patientId: string;

  @ApiProperty({ description: 'Appointment ID', example: '64f1a2b3c4d5e6f7g8h9i0j2', required: false })
  @IsOptional()
  @IsMongoId()
  appointmentId?: string;

  @ApiProperty({ description: 'Medical diagnosis', example: 'Hypertension stage 1' })
  @IsString()
  @MaxLength(1000)
  diagnosis: string;

  @ApiProperty({ 
    description: 'Prescription items', 
    type: [PrescriptionItemDto],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  prescription?: PrescriptionItemDto[];

  @ApiProperty({ description: 'Additional notes', example: 'Patient shows good response to treatment', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiProperty({ 
    description: 'File attachments', 
    type: [AttachmentDto],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];

  @ApiProperty({ 
    description: 'Vital signs measurements', 
    type: VitalSignsDto,
    required: false 
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => VitalSignsDto)
  vitalSigns?: VitalSignsDto;
}
