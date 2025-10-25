import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ImportFormat {
  JSON = 'json',
  CSV = 'csv',
}

export class ImportDataDto {
  @ApiProperty({ 
    description: 'Data to import', 
    example: { departments: [{ name: 'Cardiology', description: 'Heart diseases' }] }
  })
  @IsObject()
  @IsNotEmpty()
  data: any;

  @ApiProperty({ description: 'Import format', enum: ImportFormat, example: ImportFormat.JSON })
  @IsEnum(ImportFormat)
  format: ImportFormat;

  @ApiProperty({ description: 'Whether to overwrite existing data', example: false, required: false })
  @IsOptional()
  overwrite?: boolean;

  @ApiProperty({ description: 'Import reason', example: 'Bulk data update', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
