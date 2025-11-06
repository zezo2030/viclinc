import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ServicesService } from './services.service';

@ApiTags('Public - Services')
@Controller('services')
export class PublicServicesController {
  constructor(private readonly service: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active services with optional department filter' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filter by department ID' })
  @ApiResponse({ status: 200, description: 'Services retrieved successfully' })
  findAll(@Query('departmentId') departmentId?: string) {
    return this.service.findAll({ departmentId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiResponse({ status: 200, description: 'Service retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}




