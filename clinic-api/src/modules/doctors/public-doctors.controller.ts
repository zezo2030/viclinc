import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { DoctorStatus } from './schemas/doctor-profile.schema';

@ApiTags('Public - Doctors')
@Controller('doctors/public')
export class PublicDoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all approved doctors' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filter by department ID' })
  @ApiQuery({ name: 'serviceId', required: false, description: 'Filter by service ID' })
  @ApiResponse({ status: 200, description: 'Approved doctors retrieved successfully' })
  async getApprovedDoctors(
    @Query('departmentId') departmentId?: string,
    @Query('serviceId') serviceId?: string,
  ) {
    return this.doctorsService.findApprovedDoctors({ departmentId, serviceId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get approved doctor details by ID' })
  @ApiParam({ name: 'id', description: 'Doctor ID' })
  @ApiResponse({ status: 200, description: 'Doctor details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Doctor not found or not approved' })
  async getApprovedDoctorById(@Param('id') id: string) {
    return this.doctorsService.findApprovedDoctorById(id);
  }
}





