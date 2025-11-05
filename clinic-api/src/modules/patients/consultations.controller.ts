import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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
    
    if (userRole === 'PATIENT') {
      query.patientId = new Types.ObjectId(userId);
    } else if (userRole === 'DOCTOR') {
      query.doctorId = new Types.ObjectId(userId);
    }
    
    if (patientId) {
      query.patientId = new Types.ObjectId(patientId);
    }
    if (doctorId) {
      query.doctorId = new Types.ObjectId(doctorId);
    }

    // جلب المواعيد من نوع VIDEO أو CHAT فقط
    query.type = { $in: [AppointmentType.VIDEO, AppointmentType.CHAT] };

    const appointments = await this.appointmentModel
      .find(query)
      .populate({ path: 'doctorId', select: 'name', model: 'DoctorProfile' })
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
}

