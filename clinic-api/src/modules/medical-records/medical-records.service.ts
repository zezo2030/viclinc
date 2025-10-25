import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MedicalRecord, MedicalRecordDocument } from './schemas/medical-record.schema';
import { MedicalRecordAudit, MedicalRecordAuditDocument, AuditAction, UserRole } from './schemas/medical-record-audit.schema';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { MedicalRecordQueryDto } from './dto/medical-record-query.dto';

export interface AuditInfo {
  userId: string;
  userRole: UserRole;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectModel(MedicalRecord.name) private medicalRecordModel: Model<MedicalRecordDocument>,
    @InjectModel(MedicalRecordAudit.name) private auditModel: Model<MedicalRecordAuditDocument>,
    @InjectModel('Appointment') private appointmentModel: Model<any>,
  ) {}

  async createRecord(doctorId: string, createDto: CreateMedicalRecordDto, auditInfo: AuditInfo): Promise<MedicalRecord> {
    // Verify doctor has appointment with patient
    if (createDto.appointmentId) {
      const appointment = await this.appointmentModel.findOne({
        _id: createDto.appointmentId,
        doctorId: new Types.ObjectId(doctorId),
        patientId: new Types.ObjectId(createDto.patientId),
        status: { $in: ['CONFIRMED', 'COMPLETED'] }
      });

      if (!appointment) {
        throw new BadRequestException('No valid appointment found between doctor and patient');
      }
    }

    const medicalRecord = new this.medicalRecordModel({
      ...createDto,
      doctorId: new Types.ObjectId(doctorId),
      patientId: new Types.ObjectId(createDto.patientId),
      appointmentId: createDto.appointmentId ? new Types.ObjectId(createDto.appointmentId) : undefined,
    });

    const savedRecord = await medicalRecord.save();

    // Log audit trail
    await this.logAudit(
      (savedRecord._id as Types.ObjectId).toString(),
      auditInfo.userId,
      auditInfo.userRole,
      AuditAction.CREATE,
      undefined,
      auditInfo
    );

    return savedRecord;
  }

  async updateRecord(recordId: string, doctorId: string, updateDto: UpdateMedicalRecordDto, auditInfo: AuditInfo): Promise<MedicalRecord> {
    const existingRecord = await this.medicalRecordModel.findOne({
      _id: recordId,
      doctorId: new Types.ObjectId(doctorId),
      isActive: true
    });

    if (!existingRecord) {
      throw new NotFoundException('Medical record not found or you do not have permission to update it');
    }

    // Calculate changes for audit
    const changes: Record<string, any> = {};
    Object.keys(updateDto).forEach(key => {
      const updateValue = (updateDto as any)[key];
      const existingValue = (existingRecord as any)[key];
      if (updateValue !== undefined && JSON.stringify(existingValue) !== JSON.stringify(updateValue)) {
        changes[key] = {
          from: existingValue,
          to: updateValue
        };
      }
    });

    if (Object.keys(changes).length === 0) {
      throw new BadRequestException('No changes detected');
    }

    // Update record with new version
    const updatedRecord = await this.medicalRecordModel.findByIdAndUpdate(
      recordId,
      {
        ...updateDto,
        version: existingRecord.version + 1
      },
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      throw new NotFoundException('Medical record not found');
    }

    // Log audit trail
    await this.logAudit(
      recordId,
      auditInfo.userId,
      auditInfo.userRole,
      AuditAction.UPDATE,
      changes,
      auditInfo
    );

    return updatedRecord;
  }

  async getPatientRecords(patientId: string, userId: string, userRole: UserRole, query: MedicalRecordQueryDto): Promise<{ records: MedicalRecord[], total: number, page: number, limit: number }> {
    // Verify access permissions
    if (userRole === UserRole.PATIENT && patientId !== userId) {
      throw new ForbiddenException('You can only access your own medical records');
    }

    if (userRole === UserRole.DOCTOR) {
      // Verify doctor has appointments with this patient
      const hasAppointment = await this.appointmentModel.exists({
        doctorId: new Types.ObjectId(userId),
        patientId: new Types.ObjectId(patientId),
        status: { $in: ['CONFIRMED', 'COMPLETED'] }
      });

      if (!hasAppointment) {
        throw new ForbiddenException('You do not have permission to access this patient\'s records');
      }
    }

    const filter: any = {
      patientId: new Types.ObjectId(patientId),
      isActive: true
    };

    if (query.doctorId) {
      filter.doctorId = new Types.ObjectId(query.doctorId);
    }

    if (query.dateFrom || query.dateTo) {
      filter.createdAt = {};
      if (query.dateFrom) {
        filter.createdAt.$gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        filter.createdAt.$lte = new Date(query.dateTo);
      }
    }

    const sort: any = {};
    sort[query.sortBy || 'createdAt'] = query.sortOrder === 'asc' ? 1 : -1;

    const skip = ((query.page || 1) - 1) * (query.limit || 10);

    const [records, total] = await Promise.all([
      this.medicalRecordModel
        .find(filter)
        .populate('doctorId', 'name email')
        .populate('patientId', 'name email')
        .populate('appointmentId', 'startAt endAt type')
        .sort(sort)
        .skip(skip)
        .limit(query.limit || 10)
        .exec(),
      this.medicalRecordModel.countDocuments(filter)
    ]);

    // Log audit trail for each record access
    for (const record of records) {
      await this.logAudit(
        (record._id as Types.ObjectId).toString(),
        userId,
        userRole,
        AuditAction.VIEW,
        undefined,
        { userId, userRole }
      );
    }

    return {
      records,
      total,
      page: query.page || 1,
      limit: query.limit || 10
    };
  }

  async getDoctorPatientRecords(doctorId: string, patientId: string, query: MedicalRecordQueryDto): Promise<{ records: MedicalRecord[], total: number, page: number, limit: number }> {
    // Verify doctor has appointments with this patient
    const hasAppointment = await this.appointmentModel.exists({
      doctorId: new Types.ObjectId(doctorId),
      patientId: new Types.ObjectId(patientId),
      status: { $in: ['CONFIRMED', 'COMPLETED'] }
    });

    if (!hasAppointment) {
      throw new ForbiddenException('You do not have permission to access this patient\'s records');
    }

    const filter: any = {
      doctorId: new Types.ObjectId(doctorId),
      patientId: new Types.ObjectId(patientId),
      isActive: true
    };

    if (query.dateFrom || query.dateTo) {
      filter.createdAt = {};
      if (query.dateFrom) {
        filter.createdAt.$gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        filter.createdAt.$lte = new Date(query.dateTo);
      }
    }

    const sort: any = {};
    sort[query.sortBy || 'createdAt'] = query.sortOrder === 'asc' ? 1 : -1;

    const skip = ((query.page || 1) - 1) * (query.limit || 10);

    const [records, total] = await Promise.all([
      this.medicalRecordModel
        .find(filter)
        .populate('doctorId', 'name email')
        .populate('patientId', 'name email')
        .populate('appointmentId', 'startAt endAt type')
        .sort(sort)
        .skip(skip)
        .limit(query.limit || 10)
        .exec(),
      this.medicalRecordModel.countDocuments(filter)
    ]);

    return {
      records,
      total,
      page: query.page || 1,
      limit: query.limit || 10
    };
  }

  async getRecordById(recordId: string, userId: string, userRole: UserRole): Promise<MedicalRecord> {
    const record = await this.medicalRecordModel
      .findById(recordId)
      .populate('doctorId', 'name email')
      .populate('patientId', 'name email')
      .populate('appointmentId', 'startAt endAt type')
      .exec();

    if (!record || !record.isActive) {
      throw new NotFoundException('Medical record not found');
    }

    // Verify access permissions
    if (userRole === UserRole.PATIENT && record.patientId.toString() !== userId) {
      throw new ForbiddenException('You can only access your own medical records');
    }

    if (userRole === UserRole.DOCTOR && record.doctorId.toString() !== userId) {
      // Verify doctor has appointments with this patient
      const hasAppointment = await this.appointmentModel.exists({
        doctorId: new Types.ObjectId(userId),
        patientId: record.patientId,
        status: { $in: ['CONFIRMED', 'COMPLETED'] }
      });

      if (!hasAppointment) {
        throw new ForbiddenException('You do not have permission to access this record');
      }
    }

    // Log audit trail
    await this.logAudit(
      recordId,
      userId,
      userRole,
      AuditAction.VIEW,
      undefined,
      { userId, userRole }
    );

    return record;
  }

  async getRecordAuditTrail(recordId: string, userId: string, userRole: UserRole): Promise<MedicalRecordAudit[]> {
    // Verify record exists and user has access
    await this.getRecordById(recordId, userId, userRole);

    return this.auditModel
      .find({ recordId: new Types.ObjectId(recordId) })
      .populate('userId', 'name email')
      .sort({ at: -1 })
      .exec();
  }

  async logAudit(
    recordId: string,
    userId: string,
    userRole: UserRole,
    action: AuditAction,
    changes?: Record<string, any>,
    metadata?: AuditInfo
  ): Promise<void> {
    const auditEntry = new this.auditModel({
      recordId: new Types.ObjectId(recordId),
      userId: new Types.ObjectId(userId),
      userRole,
      action,
      changes,
      at: new Date(),
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      metadata: metadata?.metadata
    });

    await auditEntry.save();
  }

  async getAllRecords(query: MedicalRecordQueryDto): Promise<{ records: MedicalRecord[], total: number, page: number, limit: number }> {
    const filter: any = { isActive: true };

    if (query.patientId) {
      filter.patientId = new Types.ObjectId(query.patientId);
    }

    if (query.doctorId) {
      filter.doctorId = new Types.ObjectId(query.doctorId);
    }

    if (query.dateFrom || query.dateTo) {
      filter.createdAt = {};
      if (query.dateFrom) {
        filter.createdAt.$gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        filter.createdAt.$lte = new Date(query.dateTo);
      }
    }

    const sort: any = {};
    sort[query.sortBy || 'createdAt'] = query.sortOrder === 'asc' ? 1 : -1;

    const skip = ((query.page || 1) - 1) * (query.limit || 10);

    const [records, total] = await Promise.all([
      this.medicalRecordModel
        .find(filter)
        .populate('doctorId', 'name email')
        .populate('patientId', 'name email')
        .populate('appointmentId', 'startAt endAt type')
        .sort(sort)
        .skip(skip)
        .limit(query.limit || 10)
        .exec(),
      this.medicalRecordModel.countDocuments(filter)
    ]);

    return {
      records,
      total,
      page: query.page || 1,
      limit: query.limit || 10
    };
  }
}
