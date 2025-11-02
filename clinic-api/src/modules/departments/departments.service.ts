import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Department, DepartmentDocument } from './schemas/department.schema';
import { DoctorProfile, DoctorProfileDocument } from '../doctors/schemas/doctor-profile.schema';
import { Service, ServiceDocument } from '../services/schemas/service.schema';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { unlink, existsSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

const unlinkAsync = promisify(unlink);
const STATIC_PREFIX = process.env.STATIC_PREFIX || '/static';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel(Department.name) private readonly deptModel: Model<DepartmentDocument>,
    @InjectModel(DoctorProfile.name) private readonly doctorProfileModel: Model<DoctorProfileDocument>,
    @InjectModel(Service.name) private readonly serviceModel: Model<ServiceDocument>,
  ) {}

  private buildLogoPath(filename: string): string {
    return `sections/logos/${filename}`;
  }

  private buildLogoUrl(logoPath?: string): string | undefined {
    if (!logoPath) return undefined;
    return `${STATIC_PREFIX}/${logoPath}`;
  }

  private async deleteLogoFile(logoPath: string): Promise<void> {
    if (!logoPath) return;
    const filePath = join(process.cwd(), 'uploads', logoPath);
    if (existsSync(filePath)) {
      try {
        await unlinkAsync(filePath);
      } catch (error) {
        // تجاهل خطأ الحذف في حالة عدم وجود الملف
        console.warn(`Failed to delete logo file: ${filePath}`, error);
      }
    }
  }

  async create(dto: CreateDepartmentDto, file?: Express.Multer.File) {
    try {
      const departmentData: any = { ...dto };
      
      if (file) {
        departmentData.logoPath = this.buildLogoPath(file.filename);
      }

      const created = await this.deptModel.create(departmentData);
      const result: any = created.toObject();
      
      // إضافة logoUrl و icon للاستجابة
      if (result.logoPath) {
        result.logoUrl = this.buildLogoUrl(result.logoPath);
        result.icon = result.logoUrl; // استخدام الشعار كأيقونة
      }
      
      return result;
    } catch (e: any) {
      // في حالة الخطأ، احذف الملف المرفوع إن وُجد
      if (file?.filename) {
        await this.deleteLogoFile(this.buildLogoPath(file.filename));
      }
      if (e?.code === 11000) throw new ConflictException('Department name already exists');
      throw e;
    }
  }

  async findAll() {
    const departments = await this.deptModel.find().sort({ name: 1 }).lean();
    return departments.map((dept: any) => {
      const logoUrl = dept.logoPath ? this.buildLogoUrl(dept.logoPath) : undefined;
      return {
        ...dept,
        logoUrl,
        icon: logoUrl, // استخدام الشعار كأيقونة
      };
    });
  }

  async findActive() {
    const departments = await this.deptModel.find({ isActive: true }).sort({ name: 1 }).lean();
    return departments.map((dept: any) => {
      const logoUrl = dept.logoPath ? this.buildLogoUrl(dept.logoPath) : undefined;
      return {
        ...dept,
        logoUrl,
        icon: logoUrl, // استخدام الشعار كأيقونة
      };
    });
  }

  async findWithDetails(id: string) {
    const department = await this.deptModel.findById(id).lean();
    if (!department) throw new NotFoundException('Department not found');
    
    // جلب الأطباء والخدمات المتعلقة بالقسم
    const [doctors, services] = await Promise.all([
      this.doctorProfileModel
        .find({ departmentId: new Types.ObjectId(id) })
        .populate('userId', 'name email phone')
        .lean(),
      this.serviceModel
        .find({ departmentId: new Types.ObjectId(id) })
        .lean(),
    ]);
    
    const result: any = {
      ...department,
      doctors,
      services,
    };
    
    // إضافة logoUrl و icon للاستجابة
    if (result.logoPath) {
      result.logoUrl = this.buildLogoUrl(result.logoPath);
      result.icon = result.logoUrl; // استخدام الشعار كأيقونة
    }
    
    return result;
  }

  async findOne(id: string) {
    const doc = await this.deptModel.findById(id).lean();
    if (!doc) throw new NotFoundException('Department not found');
    
    // إضافة logoUrl و icon للاستجابة
    const result: any = { ...doc };
    if (result.logoPath) {
      result.logoUrl = this.buildLogoUrl(result.logoPath);
      result.icon = result.logoUrl; // استخدام الشعار كأيقونة
    }
    
    return result;
  }

  async update(id: string, dto: UpdateDepartmentDto, file?: Express.Multer.File) {
    try {
      // جلب القسم الحالي لحذف الملف القديم
      const existingDept = await this.deptModel.findById(id);
      if (!existingDept) throw new NotFoundException('Department not found');

      const updateData: any = { ...dto };
      const oldLogoPath = existingDept.logoPath;

      // إذا تم رفع ملف جديد، احفظ المسار الجديد واحذف القديم
      if (file) {
        updateData.logoPath = this.buildLogoPath(file.filename);
        
        // حذف الملف القديم إن وُجد
        if (oldLogoPath) {
          await this.deleteLogoFile(oldLogoPath);
        }
      }

      const doc = await this.deptModel.findByIdAndUpdate(id, updateData, { new: true });
      if (!doc) throw new NotFoundException('Department not found');
      
      const result: any = doc.toObject();
      
      // إضافة logoUrl و icon للاستجابة
      if (result.logoPath) {
        result.logoUrl = this.buildLogoUrl(result.logoPath);
        result.icon = result.logoUrl; // استخدام الشعار كأيقونة
      }
      
      return result;
    } catch (e: any) {
      // في حالة الخطأ، احذف الملف المرفوع إن وُجد
      if (file?.filename) {
        await this.deleteLogoFile(this.buildLogoPath(file.filename));
      }
      if (e?.code === 11000) throw new ConflictException('Department name already exists');
      throw e;
    }
  }

  async remove(id: string) {
    const res = await this.deptModel.findById(id);
    if (!res) throw new NotFoundException('Department not found');
    
    // حذف ملف الشعار إن وُجد
    if (res.logoPath) {
      await this.deleteLogoFile(res.logoPath);
    }
    
    await this.deptModel.findByIdAndDelete(id);
    return { deleted: true };
  }
}


