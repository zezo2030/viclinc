import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DoctorProfile, DoctorProfileDocument, DoctorStatus } from './schemas/doctor-profile.schema';
import { DoctorService, DoctorServiceDocument } from './schemas/doctor-service.schema';
import { User, UserDocument, Role } from '../users/schemas/user.schema';
import { Department, DepartmentDocument } from '../departments/schemas/department.schema';
import { Service, ServiceDocument } from '../services/schemas/service.schema';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { UpdateDoctorStatusDto } from './dto/update-doctor-status.dto';
import { UpdateDoctorServiceDto } from './dto/update-doctor-service.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(DoctorProfile.name) private readonly doctorProfileModel: Model<DoctorProfileDocument>,
    @InjectModel(DoctorService.name) private readonly doctorServiceModel: Model<DoctorServiceDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Department.name) private readonly departmentModel: Model<DepartmentDocument>,
    @InjectModel(Service.name) private readonly serviceModel: Model<ServiceDocument>,
  ) {}

  // إنشاء طبيب جديد (للأدمن)
  async createDoctor(createDoctorDto: CreateDoctorDto) {
    const { userId, ...profileData } = createDoctorDto;

    // التحقق من وجود المستخدم
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // التحقق من أن المستخدم ليس طبيباً بالفعل
    const existingProfile = await this.doctorProfileModel.findOne({ userId: new Types.ObjectId(userId) });
    if (existingProfile) {
      throw new ConflictException('User already has a doctor profile');
    }

    // التحقق من وجود القسم
    const department = await this.departmentModel.findById(profileData.departmentId);
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // التحقق من عدم تكرار رقم الترخيص
    const existingLicense = await this.doctorProfileModel.findOne({ licenseNumber: profileData.licenseNumber });
    if (existingLicense) {
      throw new ConflictException('License number already exists');
    }

    // إنشاء ملف الطبيب
    const doctorProfile = await this.doctorProfileModel.create({
      userId: new Types.ObjectId(userId),
      ...profileData,
      departmentId: new Types.ObjectId(profileData.departmentId),
    });

    // تحديث دور المستخدم إلى DOCTOR
    await this.userModel.findByIdAndUpdate(userId, { role: Role.DOCTOR });

    return doctorProfile;
  }

  // الحصول على قائمة الأطباء (للأدمن)
  async findAllDoctors(status?: DoctorStatus, departmentId?: string) {
    const filter: any = {};
    if (status) filter.status = status;
    if (departmentId) filter.departmentId = new Types.ObjectId(departmentId);

    return this.doctorProfileModel
      .find(filter)
      .populate('userId', 'email phone')
      .populate('departmentId', 'name')
      .sort({ createdAt: -1 });
  }

  // الحصول على طبيب بالمعرف (للأدمن)
  async findDoctorById(id: string) {
    const doctor = await this.doctorProfileModel
      .findById(id)
      .populate('userId', 'email phone')
      .populate('departmentId', 'name');
    
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    
    return doctor;
  }

  // تحديث حالة الطبيب (للأدمن)
  async updateDoctorStatus(id: string, updateStatusDto: UpdateDoctorStatusDto) {
    const doctor = await this.doctorProfileModel.findById(id);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    doctor.status = updateStatusDto.status;
    return doctor.save();
  }

  // الحصول على ملف الطبيب الحالي (للطبيب)
  async getCurrentDoctorProfile(userId: string) {
    const doctor = await this.doctorProfileModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('departmentId', 'name');
    
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }
    
    return doctor;
  }

  // تحديث ملف الطبيب (للطبيب)
  async updateDoctorProfile(userId: string, updateProfileDto: UpdateDoctorProfileDto) {
    const doctor = await this.doctorProfileModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    // التحقق من عدم تكرار رقم الترخيص إذا تم تحديثه
    if (updateProfileDto.licenseNumber && updateProfileDto.licenseNumber !== doctor.licenseNumber) {
      const existingLicense = await this.doctorProfileModel.findOne({ 
        licenseNumber: updateProfileDto.licenseNumber,
        _id: { $ne: doctor._id }
      });
      if (existingLicense) {
        throw new ConflictException('License number already exists');
      }
    }

    Object.assign(doctor, updateProfileDto);
    return doctor.save();
  }

  // الحصول على خدمات الطبيب
  async getDoctorServices(userId: string) {
    const doctor = await this.doctorProfileModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    return this.doctorServiceModel
      .find({ doctorId: doctor._id })
      .populate('serviceId', 'name description basePrice baseDuration')
      .sort({ createdAt: -1 });
  }

  // إضافة أو تحديث خدمة للطبيب
  async updateDoctorService(userId: string, serviceId: string, updateServiceDto: UpdateDoctorServiceDto) {
    const doctor = await this.doctorProfileModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    // التحقق من وجود الخدمة
    const service = await this.serviceModel.findById(serviceId);
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // التحقق من أن الخدمة تنتمي لنفس قسم الطبيب
    if (!service.departmentId.equals(doctor.departmentId)) {
      throw new BadRequestException('Service does not belong to doctor\'s department');
    }

    // البحث عن الخدمة أو إنشاؤها
    let doctorService = await this.doctorServiceModel.findOne({
      doctorId: doctor._id,
      serviceId: new Types.ObjectId(serviceId),
    });

    if (doctorService) {
      // تحديث الخدمة الموجودة
      Object.assign(doctorService, updateServiceDto);
      return doctorService.save();
    } else {
      // إنشاء خدمة جديدة
      return this.doctorServiceModel.create({
        doctorId: doctor._id,
        serviceId: new Types.ObjectId(serviceId),
        ...updateServiceDto,
      });
    }
  }

  // حذف خدمة من الطبيب
  async removeDoctorService(userId: string, serviceId: string) {
    const doctor = await this.doctorProfileModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    const result = await this.doctorServiceModel.deleteOne({
      doctorId: doctor._id,
      serviceId: new Types.ObjectId(serviceId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Doctor service not found');
    }

    return { message: 'Service removed successfully' };
  }

  // التحقق من حالة الطبيب للدخول
  async checkDoctorStatus(userId: string): Promise<boolean> {
    const doctor = await this.doctorProfileModel.findOne({ userId: new Types.ObjectId(userId) });
    return doctor?.status === DoctorStatus.APPROVED;
  }
}
