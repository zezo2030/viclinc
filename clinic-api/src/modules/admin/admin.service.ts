import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DoctorProfile, DoctorProfileDocument } from '../doctors/schemas/doctor-profile.schema';
import { Appointment, AppointmentDocument, AppointmentStatus } from '../schedule/schemas/appointment.schema';
import { AdminAudit, AdminAuditDocument } from './schemas/admin-audit.schema';
import { AppointmentService } from '../schedule/services/appointment.service';
import { ConfirmAppointmentDto } from '../schedule/dto/confirm-appointment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import dayjs from 'dayjs';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(DoctorProfile.name)
    private readonly doctorProfileModel: Model<DoctorProfileDocument>,
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<AppointmentDocument>,
    @InjectModel(AdminAudit.name)
    private readonly adminAuditModel: Model<AdminAuditDocument>,
    private readonly appointmentService: AppointmentService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getDoctors(query: any) {
    const { status, departmentId, page = 1, limit = 10 } = query;
    const filter: any = {};
    
    if (status) filter.status = status;
    if (departmentId) filter.departmentId = departmentId;

    const skip = (page - 1) * limit;
    
    const [doctors, total] = await Promise.all([
      this.doctorProfileModel
        .find(filter)
        .populate('userId', 'email phone name')
        .populate('departmentId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.doctorProfileModel.countDocuments(filter),
    ]);

    return {
      doctors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateDoctorStatus(doctorId: string, updateStatusDto: any) {
    const doctor = await this.doctorProfileModel.findByIdAndUpdate(
      doctorId,
      { status: updateStatusDto.status },
      { new: true }
    ).populate('userId', 'email phone name');

    if (!doctor) {
      throw new Error('Doctor not found');
    }

    return doctor;
  }

  async getDoctorSchedule(doctorId: string) {
    // This would integrate with the existing schedule service
    // For now, return a placeholder
    return {
      doctorId,
      schedule: [],
      message: 'Schedule data will be integrated with existing schedule service'
    };
  }

  async getDoctorAppointments(doctorId: string, query: any) {
    const { status, startDate, endDate, page = 1, limit = 10 } = query;
    const filter: any = { doctorId: new Types.ObjectId(doctorId) };
    
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.startAt = {};
      if (startDate) filter.startAt.$gte = new Date(startDate);
      if (endDate) filter.startAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    const [appointments, total] = await Promise.all([
      this.appointmentModel
        .find(filter)
        .populate('patientId', 'email phone name')
        .populate('serviceId', 'name')
        .sort({ startAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.appointmentModel.countDocuments(filter),
    ]);

    return {
      appointments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAppointments(query: any) {
    const { status, type, doctorId, patientId, startDate, endDate, page = 1, limit = 10, search } = query;
    
    // Build base match filter
    const match: any = {};
    if (status) match.status = status;
    if (type) match.type = type;
    if (doctorId) match.doctorId = new Types.ObjectId(doctorId);
    if (patientId) match.patientId = new Types.ObjectId(patientId);
    if (startDate || endDate) {
      match.startAt = {};
      if (startDate) match.startAt.$gte = new Date(startDate);
      if (endDate) match.startAt.$lte = new Date(endDate);
    }

    // Use aggregation pipeline if search is needed, otherwise use simple find
    if (search) {
      const pipeline: any[] = [
        { $match: match },
        {
          $lookup: {
            from: 'doctorProfiles',
            localField: 'doctorId',
            foreignField: '_id',
            as: 'doctor',
          },
        },
        { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'patientId',
            foreignField: '_id',
            as: 'patient',
          },
        },
        { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            doctorName: { $ifNull: ['$doctor.name', ''] },
            patientName: { $ifNull: ['$patient.name', ''] },
            patientEmail: { $ifNull: ['$patient.email', ''] },
          },
        },
        {
          $match: {
            $or: [
              { doctorName: { $regex: search, $options: 'i' } },
              { patientName: { $regex: search, $options: 'i' } },
              { patientEmail: { $regex: search, $options: 'i' } },
            ],
          },
        },
        {
          $lookup: {
            from: 'services',
            localField: 'serviceId',
            foreignField: '_id',
            as: 'service',
          },
        },
        { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
        { $sort: { startAt: -1 } },
      ];

      const countPipeline = [...pipeline, { $count: 'total' }];
      const [{ total } = { total: 0 }] = await this.appointmentModel.aggregate(countPipeline).exec();

      const skip = (page - 1) * limit;
      pipeline.push({ $skip: skip }, { $limit: limit });

      const appointments = await this.appointmentModel.aggregate(pipeline).exec();

      // Transform aggregation result to match expected format
      const transformedAppointments = appointments.map((apt: any) => ({
        ...apt,
        doctorId: apt.doctorId,
        patientId: apt.patientId,
        serviceId: apt.serviceId,
        doctor: apt.doctor ? { name: apt.doctor.name, licenseNumber: apt.doctor.licenseNumber } : null,
        patient: apt.patient ? { name: apt.patient.name, email: apt.patient.email, phone: apt.patient.phone } : null,
        service: apt.service ? { name: apt.service.name } : null,
      }));

      return {
        appointments: transformedAppointments,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    // Simple find for non-search queries
    const skip = (page - 1) * limit;
    
    const [appointments, total] = await Promise.all([
      this.appointmentModel
        .find(match)
        .populate('doctorId', 'name licenseNumber')
        .populate('patientId', 'email phone name')
        .populate('serviceId', 'name')
        .sort({ startAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.appointmentModel.countDocuments(match),
    ]);

    return {
      appointments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAppointmentById(appointmentId: string) {
    const appointment = await this.appointmentModel
      .findById(appointmentId)
      .populate('doctorId', 'name licenseNumber')
      .populate('patientId', 'email phone name')
      .populate('serviceId', 'name')
      .lean();

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async deleteAppointment(appointmentId: string) {
    const appointment = await this.appointmentModel.findById(appointmentId);

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status !== AppointmentStatus.CANCELLED) {
      throw new BadRequestException('لا يمكن حذف إلا المواعيد الملغاة فقط');
    }

    await this.appointmentModel.deleteOne({ _id: appointmentId });

    return {
      success: true,
      message: 'تم حذف الموعد بنجاح',
    };
  }

  async updateAppointmentStatus(appointmentId: string, updateStatusDto: any) {
    // If status is being changed to CONFIRMED, use AppointmentService.confirmAppointment
    // to ensure all business logic and notifications are triggered
    if (updateStatusDto.status === AppointmentStatus.CONFIRMED) {
      // Get the appointment first to get doctorId
      const appointment = await this.appointmentModel.findById(appointmentId);
      
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Use AppointmentService.confirmAppointment which handles all validation and notifications
      const confirmDto: ConfirmAppointmentDto = {
        notes: updateStatusDto.notes || undefined,
      };
      
      return await this.appointmentService.confirmAppointment(
        appointmentId,
        appointment.doctorId.toString(),
        confirmDto,
      );
    }

    // For other status changes, use the direct update
    const appointment = await this.appointmentModel.findByIdAndUpdate(
      appointmentId,
      { 
        status: updateStatusDto.status,
        ...(updateStatusDto.status === AppointmentStatus.CANCELLED && {
          cancellationReason: updateStatusDto.reason,
          cancelledAt: new Date(),
        }),
      },
      { new: true }
    ).populate('doctorId', 'name licenseNumber')
     .populate('patientId', 'email phone name')
     .populate('serviceId', 'name');

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Send notification to patient if appointment is cancelled from dashboard
    if (updateStatusDto.status === AppointmentStatus.CANCELLED) {
      try {
        const doctorName = (appointment.doctorId as any)?.name || 'الطبيب';
        const serviceName = (appointment.serviceId as any)?.name || '';
        const appointmentDate = dayjs(appointment.startAt).format('YYYY-MM-DD');
        const appointmentTime = dayjs(appointment.startAt).format('HH:mm');
        
        // Handle patientId - it might be ObjectId or populated object
        let patientId: string;
        if (appointment.patientId instanceof Types.ObjectId) {
          patientId = appointment.patientId.toString();
        } else if ((appointment.patientId as any)?._id) {
          // Populated object
          patientId = (appointment.patientId as any)._id.toString();
        } else if (typeof appointment.patientId === 'string') {
          patientId = appointment.patientId;
        } else {
          // Fallback: try toString()
          patientId = String(appointment.patientId);
        }
        
        const title = 'تم إلغاء موعدك';
        const body = `تم إلغاء موعدك مع ${doctorName}${serviceName ? ` - ${serviceName}` : ''} في ${appointmentDate} الساعة ${appointmentTime}${updateStatusDto.reason ? `. السبب: ${updateStatusDto.reason}` : ''}`;
        
        await this.notificationsService.sendNotificationToUser(
          patientId,
          title,
          body,
          {
            type: 'appointment_cancelled',
            appointmentId: String((appointment as AppointmentDocument)._id || (appointment as any).id),
          },
        );
      } catch (error) {
        console.error('Failed to send notification for appointment cancellation from dashboard:', error);
      }
    }

    return appointment;
  }

  async getAppointmentConflicts() {
    // Find appointments with potential conflicts
    const conflicts = await this.appointmentModel.aggregate([
      {
        $match: {
          status: { $in: ['PENDING_CONFIRM', 'CONFIRMED'] }
        }
      },
      {
        $group: {
          _id: '$doctorId',
          appointments: { $push: '$$ROOT' }
        }
      },
      {
        $match: {
          'appointments.1': { $exists: true }
        }
      }
    ]);

    return conflicts;
  }

  async getSystemHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
        api: 'running'
      }
    };
  }

  async getSystemLogs(query: any) {
    const { level, startDate, endDate, page = 1, limit = 10 } = query;
    const filter: any = {};
    
    if (level) filter.level = level;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    const [logs, total] = await Promise.all([
      this.adminAuditModel
        .find(filter)
        .populate('adminId', 'email name')
        .populate('targetUserId', 'email name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.adminAuditModel.countDocuments(filter),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createBackup() {
    // This would integrate with a backup service
    return {
      backupId: `backup_${Date.now()}`,
      status: 'created',
      timestamp: new Date().toISOString(),
      message: 'Backup functionality will be implemented with proper backup service'
    };
  }

  async getAuditLogs(query: any) {
    const { action, adminId, startDate, endDate, page = 1, limit = 10 } = query;
    const filter: any = {};
    
    if (action) filter.action = action;
    if (adminId) filter.adminId = adminId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    const [auditLogs, total] = await Promise.all([
      this.adminAuditModel
        .find(filter)
        .populate('adminId', 'email name')
        .populate('targetUserId', 'email name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.adminAuditModel.countDocuments(filter),
    ]);

    return {
      auditLogs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
