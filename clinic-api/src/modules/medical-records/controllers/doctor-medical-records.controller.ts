import { Controller, Post, Patch, Get, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { MedicalRecordsService } from '../medical-records.service';
import { CreateMedicalRecordDto } from '../dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from '../dto/update-medical-record.dto';
import { MedicalRecordQueryDto } from '../dto/medical-record-query.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { DoctorRoleGuard } from '../../shared/guards/doctor-role.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { User } from '../../users/schemas/user.schema';
import { UserRole } from '../schemas/medical-record-audit.schema';

@ApiTags('Doctor Medical Records')
@ApiBearerAuth()
@Controller('doctor/records')
@UseGuards(JwtAuthGuard, DoctorRoleGuard)
export class DoctorMedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new medical record' })
  @ApiResponse({ status: 201, description: 'Medical record created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden - no valid appointment with patient' })
  async createRecord(
    @Body() createDto: CreateMedicalRecordDto,
    @CurrentUser() user: User,
    @Req() req: any,
  ) {
    const auditInfo = {
      userId: (user as any)._id.toString(),
      userRole: UserRole.DOCTOR,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { sessionId: req.sessionID }
    };

    return this.medicalRecordsService.createRecord(
      (user as any)._id.toString(),
      createDto,
      auditInfo
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a medical record' })
  @ApiParam({ name: 'id', description: 'Medical record ID' })
  @ApiResponse({ status: 200, description: 'Medical record updated successfully' })
  @ApiResponse({ status: 400, description: 'No changes detected or invalid data' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your record' })
  @ApiResponse({ status: 404, description: 'Medical record not found' })
  async updateRecord(
    @Param('id') recordId: string,
    @Body() updateDto: UpdateMedicalRecordDto,
    @CurrentUser() user: User,
    @Req() req: any,
  ) {
    const auditInfo = {
      userId: (user as any)._id.toString(),
      userRole: UserRole.DOCTOR,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { sessionId: req.sessionID }
    };

    return this.medicalRecordsService.updateRecord(
      recordId,
      (user as any)._id.toString(),
      updateDto,
      auditInfo
    );
  }

  @Get(':patientId')
  @ApiOperation({ summary: 'Get medical records for a specific patient' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  @ApiResponse({ status: 200, description: 'Patient records retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - no appointment with this patient' })
  async getPatientRecords(
    @Param('patientId') patientId: string,
    @Query() query: MedicalRecordQueryDto,
    @CurrentUser() user: User,
  ) {
    return this.medicalRecordsService.getDoctorPatientRecords(
      (user as any)._id.toString(),
      patientId,
      query
    );
  }

  @Get(':id/details')
  @ApiOperation({ summary: 'Get detailed medical record by ID' })
  @ApiParam({ name: 'id', description: 'Medical record ID' })
  @ApiResponse({ status: 200, description: 'Medical record details retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - no access to this record' })
  @ApiResponse({ status: 404, description: 'Medical record not found' })
  async getRecordDetails(
    @Param('id') recordId: string,
    @CurrentUser() user: User,
  ) {
    return this.medicalRecordsService.getRecordById(
      recordId,
      (user as any)._id.toString(),
      UserRole.DOCTOR
    );
  }

  @Get(':id/audit')
  @ApiOperation({ summary: 'Get audit trail for a medical record' })
  @ApiParam({ name: 'id', description: 'Medical record ID' })
  @ApiResponse({ status: 200, description: 'Audit trail retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - no access to this record' })
  @ApiResponse({ status: 404, description: 'Medical record not found' })
  async getRecordAudit(
    @Param('id') recordId: string,
    @CurrentUser() user: User,
  ) {
    return this.medicalRecordsService.getRecordAuditTrail(
      recordId,
      (user as any)._id.toString(),
      UserRole.DOCTOR
    );
  }
}
