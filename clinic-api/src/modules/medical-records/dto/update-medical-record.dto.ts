import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsArray, ValidateNested, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { PrescriptionItemDto, AttachmentDto, VitalSignsDto } from './create-medical-record.dto';

export class UpdateMedicalRecordDto {
  @ApiProperty({ description: 'Medical diagnosis', example: 'Hypertension stage 2', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  diagnosis?: string;

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

  @ApiProperty({ description: 'Additional notes', example: 'Updated treatment plan', required: false })
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
