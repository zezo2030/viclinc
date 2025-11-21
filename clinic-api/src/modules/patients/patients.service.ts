import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DoctorProfile, DoctorProfileDocument, DoctorStatus } from '../doctors/schemas/doctor-profile.schema';
import { DoctorService, DoctorServiceDocument } from '../doctors/schemas/doctor-service.schema';
import { Department, DepartmentDocument } from '../departments/schemas/department.schema';
import { Service, ServiceDocument } from '../services/schemas/service.schema';
import { AvailabilityService } from '../schedule/services/availability.service';

export interface DoctorListFilters {
  departmentId?: string;
  serviceId?: string;
  status?: DoctorStatus;
}

export interface DoctorListItem {
  _id: string;
  name: string;
  licenseNumber: string;
  yearsOfExperience: number;
  departmentId: string;
  departmentName: string;
  status: DoctorStatus;
  bio?: string;
  avatar?: string | null;
  services: {
    serviceId: string;
    serviceName: string;
    customPrice?: number;
    customDuration?: number;
  }[];
}

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(DoctorProfile.name) 
    private readonly doctorProfileModel: Model<DoctorProfileDocument>,
    @InjectModel(DoctorService.name) 
    private readonly doctorServiceModel: Model<DoctorServiceDocument>,
    @InjectModel(Department.name) 
    private readonly departmentModel: Model<DepartmentDocument>,
    @InjectModel(Service.name) 
    private readonly serviceModel: Model<ServiceDocument>,
    private readonly availabilityService: AvailabilityService,
  ) {}

  async getDoctors(filters: DoctorListFilters = {}): Promise<DoctorListItem[]> {
    const query: any = {};
    
    if (filters.status) {
      query.status = filters.status;
    } else {
      // افتراضياً، عرض الأطباء المعتمدين فقط
      query.status = DoctorStatus.APPROVED;
    }

    if (filters.departmentId) {
      query.departmentId = new Types.ObjectId(filters.departmentId);
    }

    const doctors = await this.doctorProfileModel
      .find(query)
      .populate('departmentId', 'name')
      .lean()
      .sort({ name: 1 });

    // فلترة حسب الخدمة إذا تم تحديدها
    let filteredDoctors = doctors;
    if (filters.serviceId) {
      const doctorIds = await this.doctorServiceModel
        .find({ 
          serviceId: new Types.ObjectId(filters.serviceId),
          isActive: true 
        })
        .distinct('doctorId');
      
      filteredDoctors = doctors.filter(doctor => 
        doctorIds.some(id => id.toString() === doctor._id.toString())
      );
    }

    // جلب خدمات كل طبيب
    const doctorsWithServices = await Promise.all(
      filteredDoctors.map(async (doctor: any) => {
        const doctorServices = await this.doctorServiceModel
          .find({ doctorId: doctor._id, isActive: true })
          .populate('serviceId', 'name')
          .lean();

        const services = doctorServices.map((ds: any) => ({
          serviceId: ds.serviceId?._id?.toString() || ds.serviceId?.toString(),
          serviceName: ds.serviceId?.name || '',
          customPrice: ds.customPrice,
          customDuration: ds.customDuration,
        }));

        return {
          _id: doctor._id.toString(),
          name: doctor.name,
          licenseNumber: doctor.licenseNumber,
          yearsOfExperience: doctor.yearsOfExperience,
          departmentId: doctor.departmentId?._id?.toString() || doctor.departmentId?.toString(),
          departmentName: doctor.departmentId?.name || '',
          status: doctor.status,
          bio: doctor.bio,
          avatar: doctor.avatar || null,
          services,
        };
      })
    );

    return doctorsWithServices;
  }

  async getDoctorById(doctorId: string): Promise<DoctorListItem> {
    const doctor: any = await this.doctorProfileModel
      .findById(doctorId)
      .populate('departmentId', 'name')
      .lean();

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const doctorServices = await this.doctorServiceModel
      .find({ doctorId: doctor._id, isActive: true })
      .populate('serviceId', 'name')
      .lean();

    const services = doctorServices.map((ds: any) => ({
      serviceId: ds.serviceId?._id?.toString() || ds.serviceId?.toString(),
      serviceName: ds.serviceId?.name || '',
      customPrice: ds.customPrice,
      customDuration: ds.customDuration,
    }));

    return {
      _id: doctor._id.toString(),
      name: doctor.name,
      licenseNumber: doctor.licenseNumber,
      yearsOfExperience: doctor.yearsOfExperience,
      departmentId: doctor.departmentId?._id?.toString() || doctor.departmentId?.toString(),
      departmentName: doctor.departmentId?.name || '',
      status: doctor.status,
      bio: doctor.bio,
      avatar: doctor.avatar || null,
      services,
    };
  }

  async getDoctorAvailability(
    doctorId: string,
    serviceId: string,
    weekStart?: string
  ) {
    return this.availabilityService.getDoctorAvailability(
      doctorId,
      serviceId,
      weekStart
    );
  }
}
