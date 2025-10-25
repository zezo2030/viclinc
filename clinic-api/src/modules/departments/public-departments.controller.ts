import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';

@ApiTags('Public - Departments')
@Controller('departments/public')
export class PublicDepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active departments' })
  @ApiResponse({ status: 200, description: 'Departments retrieved successfully' })
  async getActiveDepartments() {
    return this.departmentsService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department details with doctors and services' })
  @ApiResponse({ status: 200, description: 'Department details retrieved successfully' })
  async getDepartmentDetails(@Param('id') id: string) {
    return this.departmentsService.findWithDetails(id);
  }
}
