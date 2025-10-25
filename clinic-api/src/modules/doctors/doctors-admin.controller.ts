import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorStatusDto } from './dto/update-doctor-status.dto';
import { AdminRoleGuard } from '../shared/guards/admin-role.guard';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { DoctorStatus } from './schemas/doctor-profile.schema';

@ApiTags('Admin - Doctors')
@ApiBearerAuth()
@Controller('admin/doctors')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class DoctorsAdminController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new doctor' })
  @ApiResponse({ status: 201, description: 'Doctor created successfully' })
  createDoctor(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorsService.createDoctor(createDoctorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all doctors with optional filters' })
  @ApiQuery({ name: 'status', required: false, enum: DoctorStatus, description: 'Filter by doctor status' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filter by department ID' })
  @ApiResponse({ status: 200, description: 'Doctors retrieved successfully' })
  findAllDoctors(
    @Query('status') status?: DoctorStatus,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.doctorsService.findAllDoctors(status, departmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get doctor by ID' })
  @ApiResponse({ status: 200, description: 'Doctor retrieved successfully' })
  findDoctorById(@Param('id') id: string) {
    return this.doctorsService.findDoctorById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update doctor status' })
  @ApiResponse({ status: 200, description: 'Doctor status updated successfully' })
  updateDoctorStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateDoctorStatusDto,
  ) {
    return this.doctorsService.updateDoctorStatus(id, updateStatusDto);
  }
}
