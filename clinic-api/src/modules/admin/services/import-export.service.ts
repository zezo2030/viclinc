import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department, DepartmentDocument } from '../../departments/schemas/department.schema';
import { Service, ServiceDocument } from '../../services/schemas/service.schema';
import { ImportDataDto, ImportFormat } from '../dto/import-data.dto';
import { AdminAudit, AdminAuditDocument, AuditAction } from '../schemas/admin-audit.schema';
const csv = require('csv-parser');
const csvWriter = require('csv-writer');
import { Readable } from 'stream';

@Injectable()
export class ImportExportService {
  constructor(
    @InjectModel(Department.name)
    private readonly departmentModel: Model<DepartmentDocument>,
    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,
    @InjectModel(AdminAudit.name)
    private readonly adminAuditModel: Model<AdminAuditDocument>,
  ) {}

  async exportDepartments(format: string = 'json') {
    const departments = await this.departmentModel.find().sort({ name: 1 }).lean();

    if (format === 'csv') {
      return this.convertToCSV(departments, [
        { id: '_id', title: 'ID' },
        { id: 'name', title: 'Name' },
        { id: 'description', title: 'Description' },
        { id: 'isActive', title: 'Is Active' },
        { id: 'createdAt', title: 'Created At' },
        { id: 'updatedAt', title: 'Updated At' },
      ]);
    }

    return {
      departments,
      exportedAt: new Date().toISOString(),
      totalCount: departments.length,
      format: 'json',
    };
  }

  async importDepartments(importDataDto: ImportDataDto, adminId: string) {
    const { data, format, overwrite = false, reason } = importDataDto;
    
    let departmentsToImport = [];
    
    if (format === ImportFormat.JSON) {
      if (!data.departments || !Array.isArray(data.departments)) {
        throw new BadRequestException('Invalid JSON format. Expected { departments: [...] }');
      }
      departmentsToImport = data.departments;
    } else if (format === ImportFormat.CSV) {
      departmentsToImport = await this.parseCSVData(data);
    } else {
      throw new BadRequestException('Unsupported import format');
    }

    const results: any = {
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: [] as any[],
    };

    for (const [index, deptData] of departmentsToImport.entries()) {
      try {
        // Validate required fields
        if (!deptData.name) {
          results.errors.push({
            index,
            error: 'Name is required',
            data: deptData,
          });
          results.skipped++;
          continue;
        }

        // Check if department exists
        const existingDept = await this.departmentModel.findOne({ name: deptData.name });
        
        if (existingDept) {
          if (overwrite) {
            await this.departmentModel.findByIdAndUpdate(existingDept._id, {
              description: deptData.description || existingDept.description,
              isActive: deptData.isActive !== undefined ? deptData.isActive : existingDept.isActive,
            });
            results.updated++;
          } else {
            results.skipped++;
            results.errors.push({
              index,
              error: 'Department already exists',
              data: deptData,
            });
          }
        } else {
          await this.departmentModel.create({
            name: deptData.name,
            description: deptData.description || '',
            isActive: deptData.isActive !== undefined ? deptData.isActive : true,
          });
          results.imported++;
        }
      } catch (error) {
        results.errors.push({
          index,
          error: error.message,
          data: deptData,
        });
        results.skipped++;
      }
    }

    // Log audit action
    await this.logAuditAction(adminId, AuditAction.IMPORT_DATA, undefined, {
      type: 'departments',
      format,
      results,
      reason,
    });

    return {
      message: 'Departments import completed',
      results,
      importedAt: new Date().toISOString(),
    };
  }

  async exportServices(format: string = 'json', departmentId?: string) {
    const filter: any = {};
    if (departmentId) {
      filter.departmentId = departmentId;
    }

    const services = await this.serviceModel
      .find(filter)
      .populate('departmentId', 'name')
      .sort({ name: 1 })
      .lean();

    if (format === 'csv') {
      return this.convertToCSV(services, [
        { id: '_id', title: 'ID' },
        { id: 'name', title: 'Name' },
        { id: 'description', title: 'Description' },
        { id: 'departmentId', title: 'Department ID' },
        { id: 'departmentName', title: 'Department Name' },
        { id: 'basePrice', title: 'Base Price' },
        { id: 'baseDuration', title: 'Base Duration' },
        { id: 'isActive', title: 'Is Active' },
        { id: 'createdAt', title: 'Created At' },
        { id: 'updatedAt', title: 'Updated At' },
      ]);
    }

    return {
      services,
      exportedAt: new Date().toISOString(),
      totalCount: services.length,
      format: 'json',
      filters: { departmentId },
    };
  }

  async importServices(importDataDto: ImportDataDto, adminId: string) {
    const { data, format, overwrite = false, reason } = importDataDto;
    
    let servicesToImport = [];
    
    if (format === ImportFormat.JSON) {
      if (!data.services || !Array.isArray(data.services)) {
        throw new BadRequestException('Invalid JSON format. Expected { services: [...] }');
      }
      servicesToImport = data.services;
    } else if (format === ImportFormat.CSV) {
      servicesToImport = await this.parseCSVData(data);
    } else {
      throw new BadRequestException('Unsupported import format');
    }

    const results: any = {
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: [] as any[],
    };

    for (const [index, serviceData] of servicesToImport.entries()) {
      try {
        // Validate required fields
        if (!serviceData.name || !serviceData.departmentId) {
          results.errors.push({
            index,
            error: 'Name and departmentId are required',
            data: serviceData,
          });
          results.skipped++;
          continue;
        }

        // Validate department exists
        const department = await this.departmentModel.findById(serviceData.departmentId);
        if (!department) {
          results.errors.push({
            index,
            error: 'Department not found',
            data: serviceData,
          });
          results.skipped++;
          continue;
        }

        // Check if service exists
        const existingService = await this.serviceModel.findOne({
          name: serviceData.name,
          departmentId: serviceData.departmentId,
        });
        
        if (existingService) {
          if (overwrite) {
            await this.serviceModel.findByIdAndUpdate(existingService._id, {
              description: serviceData.description || existingService.description,
              basePrice: serviceData.basePrice !== undefined ? serviceData.basePrice : existingService.basePrice,
              baseDuration: serviceData.baseDuration !== undefined ? serviceData.baseDuration : existingService.baseDuration,
              isActive: serviceData.isActive !== undefined ? serviceData.isActive : existingService.isActive,
            });
            results.updated++;
          } else {
            results.skipped++;
            results.errors.push({
              index,
              error: 'Service already exists in department',
              data: serviceData,
            });
          }
        } else {
          await this.serviceModel.create({
            name: serviceData.name,
            description: serviceData.description || '',
            departmentId: serviceData.departmentId,
            basePrice: serviceData.basePrice || 0,
            baseDuration: serviceData.baseDuration || 30,
            isActive: serviceData.isActive !== undefined ? serviceData.isActive : true,
          });
          results.imported++;
        }
      } catch (error) {
        results.errors.push({
          index,
          error: error.message,
          data: serviceData,
        });
        results.skipped++;
      }
    }

    // Log audit action
    await this.logAuditAction(adminId, AuditAction.IMPORT_DATA, undefined, {
      type: 'services',
      format,
      results,
      reason,
    });

    return {
      message: 'Services import completed',
      results,
      importedAt: new Date().toISOString(),
    };
  }

  async exportUsers(format: string = 'json', role?: string) {
    // This would require importing User model and implementing user export
    // For now, return a placeholder
    return {
      message: 'User export functionality will be implemented',
      format,
      filters: { role },
    };
  }

  async importUsers(importDataDto: ImportDataDto, adminId: string) {
    // This would require implementing user import
    // For now, return a placeholder
    return {
      message: 'User import functionality will be implemented',
      results: {
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: [],
      },
    };
  }

  private async convertToCSV(data: any[], headers: any[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const csvString = [];
      
      // Add headers
      csvString.push(headers.map(h => h.title).join(','));
      
      // Add data rows
      data.forEach(item => {
        const row = headers.map(header => {
          let value = item[header.id];
          
          // Handle nested objects
          if (header.id === 'departmentName' && item.departmentId && item.departmentId.name) {
            value = item.departmentId.name;
          }
          
          // Format dates
          if (value instanceof Date) {
            value = value.toISOString();
          }
          
          // Escape commas and quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          
          return value || '';
        });
        csvString.push(row.join(','));
      });
      
      resolve(csvString.join('\n'));
    });
  }

  private async parseCSVData(csvData: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from([csvData]);
      
      stream
        .pipe(csv())
        .on('data', (data: any) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error: any) => reject(error));
    });
  }

  private async logAuditAction(
    adminId: string,
    action: AuditAction,
    targetUserId?: string,
    metadata?: Record<string, any>,
  ) {
    const auditLog = new this.adminAuditModel({
      adminId,
      action,
      targetUserId,
      metadata,
      success: true,
    });

    await auditLog.save();
  }

  async getImportExportHistory(adminId?: string, limit: number = 50) {
    const filter: any = {
      action: { $in: [AuditAction.IMPORT_DATA, AuditAction.EXPORT_DATA] },
    };
    
    if (adminId) {
      filter.adminId = adminId;
    }

    const history = await this.adminAuditModel
      .find(filter)
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return history;
  }

  async validateImportData(data: any, type: 'departments' | 'services'): Promise<{ valid: boolean; errors: string[] }> {
    const errors = [];
    
    if (type === 'departments') {
      if (!data.departments || !Array.isArray(data.departments)) {
        errors.push('Invalid format: expected { departments: [...] }');
      } else {
        data.departments.forEach((dept: any, index: number) => {
          if (!dept.name) {
            errors.push(`Row ${index + 1}: Name is required`);
          }
        });
      }
    } else if (type === 'services') {
      if (!data.services || !Array.isArray(data.services)) {
        errors.push('Invalid format: expected { services: [...] }');
      } else {
        data.services.forEach((service: any, index: number) => {
          if (!service.name) {
            errors.push(`Row ${index + 1}: Name is required`);
          }
          if (!service.departmentId) {
            errors.push(`Row ${index + 1}: Department ID is required`);
          }
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
