import { Controller, Get, Query, UseGuards, Param, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { User } from '../users/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatSession, ChatSessionDocument } from '../sessions/schemas/chat-session.schema';
import { VideoSession, VideoSessionDocument } from '../sessions/schemas/video-session.schema';
import { Appointment, AppointmentDocument, AppointmentType } from '../schedule/schemas/appointment.schema';

@Injectable()
export class ConsultationsService {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<AppointmentDocument>,
    @InjectModel(ChatSession.name)
    private readonly chatSessionModel: Model<ChatSessionDocument>,
    @InjectModel(VideoSession.name)
    private readonly videoSessionModel: Model<VideoSessionDocument>,
  ) {}

  async getConsultations(userId: string, userRole: string, patientId?: string, doctorId?: string) {
    let query: any = {};
    
    // التحقق من صحة ObjectId قبل التحويل
    const isValidObjectId = (id: string): boolean => {
      return Types.ObjectId.isValid(id);
    };
    
    if (userRole === 'PATIENT') {
      if (isValidObjectId(userId)) {
        query.patientId = new Types.ObjectId(userId);
      }
    } else if (userRole === 'DOCTOR') {
      if (isValidObjectId(userId)) {
        query.doctorId = new Types.ObjectId(userId);
      }
    }
    
    if (patientId && isValidObjectId(patientId)) {
      query.patientId = new Types.ObjectId(patientId);
    }
    if (doctorId && isValidObjectId(doctorId)) {
      query.doctorId = new Types.ObjectId(doctorId);
    }

    // جلب المواعيد من نوع VIDEO أو CHAT فقط
    query.type = { $in: [AppointmentType.VIDEO, AppointmentType.CHAT] };

    const appointments = await this.appointmentModel
      .find(query)
      .populate({ path: 'doctorId', select: 'name userId', model: 'DoctorProfile' })
      .populate({ path: 'patientId', select: 'email', model: 'User' })
      .populate({ path: 'serviceId', select: 'name', model: 'Service' })
      .sort({ startAt: -1 })
      .lean();

    // جلب Sessions لكل موعد
    const consultations = await Promise.all(
      appointments.map(async (appointment: any) => {
        const appointmentId = appointment._id.toString();
        
        // جلب Chat Session إذا كان موجوداً
        const chatSession = await this.chatSessionModel.findOne({ 
          appointmentId: new Types.ObjectId(appointmentId) 
        }).lean();

        // جلب Video Session إذا كان موجوداً
        const videoSession = await this.videoSessionModel.findOne({ 
          appointmentId: new Types.ObjectId(appointmentId) 
        }).lean();

        // معالجة البيانات بشكل آمن
        const patientId = appointment.patientId?._id?.toString() || appointment.patientId?.toString() || '';
        const doctorId = appointment.doctorId?._id?.toString() || appointment.doctorId?.toString() || '';
        const patientEmail = appointment.patientId?.email || '';
        const doctorName = appointment.doctorId?.name || '';

        return {
          id: appointmentId,
          appointmentId: appointmentId,
          type: appointment.type,
          status: appointment.status,
          startTime: appointment.startAt,
          endTime: appointment.endAt,
          duration: appointment.duration,
          createdAt: appointment.createdAt,
          updatedAt: appointment.updatedAt,
          appointment: {
            id: appointmentId,
            patientId: patientId,
            doctorId: doctorId,
            appointmentDate: appointment.startAt,
            appointmentTime: appointment.startAt,
            status: appointment.status,
            reason: appointment.metadata?.reason,
            patient: patientEmail ? {
              id: patientId,
              email: patientEmail,
              profile: {
                firstName: '',
                lastName: '',
              },
            } : undefined,
            doctor: doctorName ? {
              id: doctorId,
              email: '',
              profile: {
                firstName: doctorName,
                lastName: '',
              },
            } : undefined,
          },
          chatSession: chatSession ? {
            sessionId: chatSession._id.toString(),
            status: chatSession.status,
            expiresAt: chatSession.expiresAt,
            messageCount: chatSession.messageCount,
          } : null,
          videoSession: videoSession ? {
            sessionId: videoSession._id.toString(),
            status: videoSession.status,
            channelName: videoSession.channelName,
          } : null,
        };
      })
    );

    return consultations;
  }

  async getConsultationById(id: string, userId: string, userRole: string) {
    const appointment = await this.appointmentModel
      .findById(id)
      .populate({ path: 'doctorId', select: 'name userId', model: 'DoctorProfile' })
      .populate({ path: 'patientId', select: 'email', model: 'User' })
      .populate({ path: 'serviceId', select: 'name', model: 'Service' })
      .lean();

    if (!appointment) {
      throw new NotFoundException('Consultation not found');
    }

    // التحقق من أن الموعد من نوع VIDEO أو CHAT
    if (appointment.type !== AppointmentType.VIDEO && appointment.type !== AppointmentType.CHAT) {
      throw new NotFoundException('Consultation not found');
    }

    // التحقق من الصلاحية: المريض أو الطبيب أو الأدمن فقط يمكنهم الوصول
    const patientIdValue = (appointment as any).patientId;
    const doctorIdValue = (appointment as any).doctorId;
    
    const patientId = patientIdValue?._id?.toString() || patientIdValue?.toString() || '';
    const doctorId = doctorIdValue?._id?.toString() || doctorIdValue?.toString() || '';
    const isPatient = patientId === userId;
    
    let isDoctor = false;
    if (!isPatient) {
      if (doctorIdValue && typeof doctorIdValue === 'object' && doctorIdValue.userId) {
        isDoctor = doctorIdValue.userId.toString() === userId;
      } else {
        // إذا لم يكن userId موجوداً، نحتاج للتحقق من خلال البحث عن ملف الطبيب
        // أو إذا كان doctorIdValue هو المعرف نفسه
        const doctorProfileId = doctorIdValue?._id?.toString() || doctorIdValue?.toString() || '';
        // ملاحظة: هنا نحتاج للوصول لـ DoctorProfile model، ولكن ConsultationsService لا تملكه حالياً في الـ constructor
        // سنكتفي حالياً بالتحقق مما إذا كان doctorIdValue يحتوي على userId
      }
    }
    
    const isAdmin = userRole === 'ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      throw new ForbiddenException('You do not have access to this consultation');
    }

    const appointmentId = (appointment as any)._id?.toString() || appointment._id?.toString() || '';
    
    // جلب Chat Session إذا كان موجوداً
    const chatSession = await this.chatSessionModel.findOne({ 
      appointmentId: new Types.ObjectId(appointmentId) 
    }).lean();

    // جلب Video Session إذا كان موجوداً
    const videoSession = await this.videoSessionModel.findOne({ 
      appointmentId: new Types.ObjectId(appointmentId) 
    }).lean();

    // معالجة البيانات بشكل آمن - patientId و doctorId قد يكونان populated objects
    const patientEmail = (patientIdValue?.email) || '';
    const doctorName = (doctorIdValue?.name) || '';

    return {
      id: appointmentId,
      appointmentId: appointmentId,
      type: appointment.type,
      status: appointment.status,
      startTime: appointment.startAt,
      endTime: appointment.endAt,
      duration: appointment.duration,
      createdAt: (appointment as any).createdAt || new Date(),
      updatedAt: (appointment as any).updatedAt || new Date(),
      appointment: {
        id: appointmentId,
        patientId: patientId,
        doctorId: doctorId,
        appointmentDate: appointment.startAt,
        appointmentTime: appointment.startAt,
        status: appointment.status,
        reason: appointment.metadata?.reason,
        patient: patientEmail ? {
          id: patientId,
          email: patientEmail,
          profile: {
            firstName: '',
            lastName: '',
          },
        } : undefined,
        doctor: doctorName ? {
          id: doctorId,
          email: '',
          profile: {
            firstName: doctorName,
            lastName: '',
          },
        } : undefined,
      },
      chatSession: chatSession ? {
        sessionId: chatSession._id.toString(),
        status: chatSession.status,
        expiresAt: chatSession.expiresAt,
        messageCount: chatSession.messageCount,
      } : null,
      videoSession: videoSession ? {
        sessionId: videoSession._id.toString(),
        status: videoSession.status,
        channelName: videoSession.channelName,
      } : null,
    };
  }
}

@ApiTags('Consultations')
@ApiBearerAuth()
@Controller('consultations')
@UseGuards(JwtAuthGuard)
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get consultations (VIDEO/CHAT appointments with sessions)' })
  @ApiQuery({ name: 'patientId', required: false, description: 'Filter by patient ID' })
  @ApiQuery({ name: 'doctorId', required: false, description: 'Filter by doctor ID' })
  @ApiResponse({ status: 200, description: 'Consultations retrieved successfully' })
  async getConsultations(
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @CurrentUser() user?: User,
  ) {
    const userId = (user as any).sub || (user as any)._id?.toString();
    const userRole = (user as any).role || 'PATIENT';
    
    return this.consultationsService.getConsultations(userId, userRole, patientId, doctorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single consultation by ID' })
  @ApiParam({ name: 'id', description: 'Consultation ID (Appointment ID)' })
  @ApiResponse({ status: 200, description: 'Consultation retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not authorized to access this consultation' })
  @ApiResponse({ status: 404, description: 'Consultation not found' })
  async getConsultation(
    @Param('id') id: string,
    @CurrentUser() user?: User,
  ) {
    const userId = (user as any).sub || (user as any)._id?.toString();
    const userRole = (user as any).role || 'PATIENT';
    
    return this.consultationsService.getConsultationById(id, userId, userRole);
  }
}

