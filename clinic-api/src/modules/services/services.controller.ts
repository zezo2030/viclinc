import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AdminRoleGuard } from '../shared/guards/admin-role.guard';

@ApiTags('Admin - Services')
@ApiBearerAuth()
@UseGuards(AdminRoleGuard)
@Controller('admin/services')
export class ServicesController {
  constructor(private readonly service: ServicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  @ApiResponse({ status: 201, description: 'Service created successfully' })
  create(@Body() dto: CreateServiceDto) { return this.service.create(dto); }

  @Get()
  @ApiOperation({ summary: 'Get all services with optional department filter' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filter by department ID' })
  @ApiResponse({ status: 200, description: 'Services retrieved successfully' })
  findAll(@Query('departmentId') departmentId?: string) { return this.service.findAll({ departmentId }); }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiResponse({ status: 200, description: 'Service retrieved successfully' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update service' })
  @ApiResponse({ status: 200, description: 'Service updated successfully' })
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete service' })
  @ApiResponse({ status: 200, description: 'Service deleted successfully' })
  remove(@Param('id') id: string) { return this.service.remove(id); }
}


