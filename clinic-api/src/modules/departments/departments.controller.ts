import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UploadedFile, UseInterceptors, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { AdminRoleGuard } from '../shared/guards/admin-role.guard';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { multerConfig } from './config/multer.config';
import { OptionalFileInterceptor } from './interceptors/optional-file.interceptor';

@ApiTags('Admin - Departments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
@Controller('admin/departments')
export class DepartmentsController {
  constructor(private readonly service: DepartmentsService) {}

  @Post()
  @UseInterceptors(OptionalFileInterceptor)
  @ApiOperation({ 
    summary: 'Create a new department',
    description: 'Create a new department. Supports both JSON and multipart/form-data formats. If using multipart/form-data, you can upload a logo file.'
  })
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Cardiology', description: 'Department name (required, min 2 characters)' },
        description: { type: 'string', example: 'Heart and cardiovascular diseases', description: 'Department description (optional)' },
        isActive: { type: 'boolean', example: true, description: 'Whether the department is active (optional, default: true)' },
        logo: { type: 'string', format: 'binary', description: 'Department logo file (optional, for multipart/form-data only)' }
      },
      required: ['name']
    }
  })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized - token missing or invalid' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  async create(
    @Body() dto: CreateDepartmentDto,
    @Req() req: Request
  ) {
    // OptionalFileInterceptor سيضيف file إلى request إذا كان multipart/form-data
    // إذا كان JSON عادي، file سيكون undefined
    const file = (req as any).file;
    return this.service.create(dto, file);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all departments',
    description: 'Retrieve a list of all departments. Returns departments with their logos and active status.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Departments retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          isActive: { type: 'boolean' },
          logoUrl: { type: 'string' },
          icon: { type: 'string' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - token missing or invalid' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  findAll() { return this.service.findAll(); }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get department by ID',
    description: 'Retrieve a specific department by its ID. Returns department details including logo and active status.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Department retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        isActive: { type: 'boolean' },
        logoPath: { type: 'string' },
        logoUrl: { type: 'string' },
        icon: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - token missing or invalid' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Patch(':id')
  @UseInterceptors(OptionalFileInterceptor)
  @ApiOperation({ 
    summary: 'Update department',
    description: 'Update an existing department. Supports both JSON and multipart/form-data formats. You can update name, description, isActive, and/or upload a new logo.'
  })
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Cardiology Updated', description: 'Department name (optional)' },
        description: { type: 'string', example: 'Updated description', description: 'Department description (optional)' },
        isActive: { type: 'boolean', example: true, description: 'Whether the department is active (optional)' },
        logo: { type: 'string', format: 'binary', description: 'New department logo file (optional, for multipart/form-data only)' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Department updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - token missing or invalid' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  async update(
    @Param('id') id: string, 
    @Body() dto: UpdateDepartmentDto,
    @Req() req: Request
  ) {
    // OptionalFileInterceptor سيضيف file إلى request إذا كان multipart/form-data
    // إذا كان JSON عادي، file سيكون undefined
    const file = (req as any).file;
    return this.service.update(id, dto, file);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete department',
    description: 'Delete a department by ID. This will also remove the associated logo file if it exists.'
  })
  @ApiResponse({ status: 200, description: 'Department deleted successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - token missing or invalid' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  remove(@Param('id') id: string) { return this.service.remove(id); }
}


