import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorStatusDto } from './dto/update-doctor-status.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { AdminRoleGuard } from '../shared/guards/admin-role.guard';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { DoctorStatus } from './schemas/doctor-profile.schema';
import { avatarUploadConfig } from '../auth/config/avatar-upload.config';

@ApiTags('Admin - Doctors')
@ApiBearerAuth()
@Controller('admin/doctors')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class DoctorsAdminController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new doctor',
    description: 'Supports both JSON and multipart/form-data. If using multipart/form-data, you can upload an avatar image.'
  })
  @ApiConsumes('application/json', 'multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar', avatarUploadConfig))
  @ApiResponse({ status: 201, description: 'Doctor created successfully' })
  createDoctor(
    @Body() createDoctorDto: CreateDoctorDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    // إذا تم رفع ملف، أضف مساره إلى DTO
    if (file) {
      const avatarPath = `/static/uploads/avatars/${file.filename}`;
      return this.doctorsService.createDoctor({ ...createDoctorDto, avatar: avatarPath });
    }
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

  @Patch(':id')
  @ApiOperation({ summary: 'Update doctor profile' })
  @ApiResponse({ status: 200, description: 'Doctor profile updated successfully' })
  updateDoctor(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateDoctorProfileDto,
  ) {
    return this.doctorsService.updateDoctorProfileById(id, updateProfileDto);
  }
}
