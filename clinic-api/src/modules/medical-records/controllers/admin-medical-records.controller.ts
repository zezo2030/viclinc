import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { MedicalRecordsService } from '../medical-records.service';
import { MedicalRecordQueryDto } from '../dto/medical-record-query.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../../shared/guards/admin-role.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { User } from '../../users/schemas/user.schema';
import { UserRole } from '../schemas/medical-record-audit.schema';

@ApiTags('Admin Medical Records')
@ApiBearerAuth()
@Controller('admin/records')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminMedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all medical records with filtering' })
  @ApiResponse({ status: 200, description: 'Medical records retrieved successfully' })
  async getAllRecords(
    @Query() query: MedicalRecordQueryDto,
    @CurrentUser() user: User,
  ) {
    return this.medicalRecordsService.getAllRecords(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed medical record by ID' })
  @ApiParam({ name: 'id', description: 'Medical record ID' })
  @ApiResponse({ status: 200, description: 'Medical record details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Medical record not found' })
  async getRecordDetails(
    @Param('id') recordId: string,
    @CurrentUser() user: User,
  ) {
    return this.medicalRecordsService.getRecordById(
      recordId,
      (user as any)._id.toString(),
      UserRole.ADMIN
    );
  }

  @Get(':id/audit')
  @ApiOperation({ summary: 'Get complete audit trail for a medical record' })
  @ApiParam({ name: 'id', description: 'Medical record ID' })
  @ApiResponse({ status: 200, description: 'Audit trail retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Medical record not found' })
  async getRecordAudit(
    @Param('id') recordId: string,
    @CurrentUser() user: User,
  ) {
    return this.medicalRecordsService.getRecordAuditTrail(
      recordId,
      (user as any)._id.toString(),
      UserRole.ADMIN
    );
  }
}
