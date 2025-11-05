import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { MedicalRecordsService } from '../medical-records.service';
import { MedicalRecordQueryDto } from '../dto/medical-record-query.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { User } from '../../users/schemas/user.schema';
import { UserRole } from '../schemas/medical-record-audit.schema';

@ApiTags('Patient Medical Records')
@ApiBearerAuth()
@Controller('patient/records')
@UseGuards(JwtAuthGuard)
export class PatientMedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current patient medical records' })
  @ApiResponse({ status: 200, description: 'Medical records retrieved successfully' })
  async getMyRecords(
    @Query() query: MedicalRecordQueryDto,
    @CurrentUser() user: User,
  ) {
    const userId = (user as any).sub || (user as any)._id?.toString();
    return this.medicalRecordsService.getPatientRecords(
      userId,
      userId,
      UserRole.PATIENT,
      query
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed medical record by ID' })
  @ApiParam({ name: 'id', description: 'Medical record ID' })
  @ApiResponse({ status: 200, description: 'Medical record details retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your record' })
  @ApiResponse({ status: 404, description: 'Medical record not found' })
  async getRecordDetails(
    @Param('id') recordId: string,
    @CurrentUser() user: User,
  ) {
    const userId = (user as any).sub || (user as any)._id?.toString();
    return this.medicalRecordsService.getRecordById(
      recordId,
      userId,
      UserRole.PATIENT
    );
  }
}
