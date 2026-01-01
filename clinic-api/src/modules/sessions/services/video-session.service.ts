import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VideoSession, VideoSessionDocument, VideoSessionStatus, ParticipantRole } from '../schemas/video-session.schema';
import { AgoraService, AgoraTokenRequest } from './agora.service';
import { RequestVideoTokenDto, VideoTokenResponseDto } from '../dto/request-video-token.dto';
import { InjectModel as InjectAppointmentModel } from '@nestjs/mongoose';
import { Appointment, AppointmentStatus } from '../../schedule/schemas/appointment.schema';
import { DoctorProfile, DoctorProfileDocument } from '../../doctors/schemas/doctor-profile.schema';
import dayjs from 'dayjs';

@Injectable()
export class VideoSessionService {
  constructor(
    @InjectModel(VideoSession.name) 
    private videoSessionModel: Model<VideoSessionDocument>,
    @InjectAppointmentModel(Appointment.name) 
    private appointmentModel: Model<any>,
    @InjectModel(DoctorProfile.name)
    private doctorProfileModel: Model<DoctorProfileDocument>,
    private readonly agoraService: AgoraService,
  ) {}

  async requestVideoToken(
    requestDto: RequestVideoTokenDto, 
    userId: string,
    options: { isTestMode?: boolean } = {},
  ): Promise<VideoTokenResponseDto> {
    const { isTestMode = false } = options;
    // التحقق من وجود الموعد
    const appointment = await this.appointmentModel.findById(requestDto.appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // التحقق من حالة الموعد
    const appointmentStatus = appointment.status as AppointmentStatus;
    if (isTestMode) {
      const blockedStatuses: AppointmentStatus[] = [
        AppointmentStatus.CANCELLED,
        AppointmentStatus.REJECTED,
        AppointmentStatus.COMPLETED,
        AppointmentStatus.NO_SHOW,
      ];
      if (blockedStatuses.includes(appointmentStatus)) {
        throw new BadRequestException('This appointment status cannot start a video session');
      }
    } else if (appointmentStatus !== AppointmentStatus.CONFIRMED) {
      throw new BadRequestException('Appointment must be confirmed to start video session');
    }

    // التحقق من نوع الموعد
    if (appointment.type !== 'VIDEO') {
      throw new BadRequestException('This appointment does not support video sessions');
    }

    // التحقق من صلاحيات المستخدم
    // patientId يشير مباشرة إلى User._id
    const isPatient = appointment.patientId.toString() === userId;
    
    // doctorId يشير إلى DoctorProfile._id، لذا نحتاج للتحقق من DoctorProfile.userId
    let isDoctor = false;
    if (!isPatient) {
      const doctorProfile = await this.doctorProfileModel.findById(appointment.doctorId);
      if (doctorProfile && doctorProfile.userId.toString() === userId) {
        isDoctor = true;
      }
    }
    
    if (!isDoctor && !isPatient) {
      throw new ForbiddenException('You are not authorized to access this appointment');
    }

    // التحقق من الدور المطلوب
    const expectedRole = isDoctor ? 'doctor' : 'patient';
    if (requestDto.role !== expectedRole) {
      throw new BadRequestException(
        `Invalid role. You are a ${isDoctor ? 'doctor' : 'patient'}, but requested role is ${requestDto.role}. Expected: ${expectedRole}`
      );
    }

    // فحص غرفة الانتظار (T-10m)
    // يمكن تعطيل هذا التحقق في وضع الاختبار/التطوير
    const appointmentStart = dayjs(appointment.startAt);
    const now = dayjs();
    const disableTimeCheck = isTestMode ||
                             process.env.DISABLE_VIDEO_TIME_CHECK === 'true' || 
                             process.env.NODE_ENV === 'development' ||
                             process.env.NODE_ENV === 'test';
    
    if (!disableTimeCheck) {
      const timeUntilStart = appointmentStart.diff(now, 'minute');
      
      if (timeUntilStart > 10) {
        throw new BadRequestException(
          `Video session is not available yet. Please wait ${timeUntilStart - 10} more minutes.`
        );
      }
    }

    // التحقق من انتهاء الموعد
    // يمكن تعطيل هذا التحقق في وضع الاختبار/التطوير
    const disableEndTimeCheck = isTestMode ||
                               process.env.DISABLE_VIDEO_TIME_CHECK === 'true' ||
                               process.env.NODE_ENV === 'development' ||
                               process.env.NODE_ENV === 'test';
    
    if (!disableEndTimeCheck) {
      const appointmentEnd = appointmentStart.add(appointment.duration, 'minute');
      // السماح ببدء الجلسة حتى 30 دقيقة بعد انتهاء الموعد (للمرونة)
      const gracePeriodMinutes = parseInt(process.env.VIDEO_SESSION_GRACE_PERIOD_MINUTES || '30', 10);
      const allowedEndTime = appointmentEnd.add(gracePeriodMinutes, 'minute');
      
      if (now.isAfter(allowedEndTime)) {
        const minutesPastEnd = now.diff(appointmentEnd, 'minute');
        throw new BadRequestException(
          `Appointment time has ended ${minutesPastEnd} minute(s) ago. The appointment ended at ${appointmentEnd.format('YYYY-MM-DD HH:mm')}. Please contact support if you need to access this session.`
        );
      }
    }

    // البحث عن جلسة موجودة أو إنشاء جديدة
    let session = await this.videoSessionModel.findOne({ 
      appointmentId: requestDto.appointmentId 
    });

    if (!session) {
      // إنشاء جلسة جديدة
      session = new this.videoSessionModel({
        appointmentId: requestDto.appointmentId,
        channelName: `appointment-${requestDto.appointmentId}`,
        status: VideoSessionStatus.WAITING,
        participants: [],
      });
      await session.save();
    }

    // التحقق من حالة الجلسة
    if (session.status === VideoSessionStatus.ENDED) {
      throw new BadRequestException('Video session has ended');
    }

    // إضافة المشارك إذا لم يكن موجوداً
    const existingParticipant = session.participants.find(
      p => p.userId.toString() === userId
    );

    if (!existingParticipant) {
      session.participants.push({
        userId: new (require('mongoose')).Types.ObjectId(userId),
        role: requestDto.role as any,
        joinedAt: new Date(),
      });
      await session.save();
    }

    // توليد توكن Agora
    const agoraRequest: AgoraTokenRequest = {
      appointmentId: requestDto.appointmentId,
      userId,
      role: requestDto.role,
    };

    const tokenData = await this.agoraService.generateToken(agoraRequest);

    // تحديث حالة الجلسة إذا كان هناك مشاركين
    if (session.participants.length >= 1) {
      session.status = VideoSessionStatus.ACTIVE;
      session.startedAt = new Date();
      await session.save();
    }

    return {
      token: tokenData.token,
      channelName: tokenData.channelName,
      uid: tokenData.uid,
      expirationTime: tokenData.expirationTime,
      appId: tokenData.appId, // إضافة AppId من AgoraService
      sessionStatus: session.status,
      canJoin: true,
    };
  }

  async getSessionInfo(appointmentId: string, userId: string): Promise<any> {
    const session = await this.videoSessionModel.findOne({ appointmentId });
    
    if (!session) {
      throw new NotFoundException('Video session not found');
    }

    // التحقق من صلاحيات الوصول
    const appointment = await this.appointmentModel.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // patientId يشير مباشرة إلى User._id
    const isPatient = appointment.patientId.toString() === userId;
    
    // doctorId يشير إلى DoctorProfile._id، لذا نحتاج للتحقق من DoctorProfile.userId
    let isDoctor = false;
    if (!isPatient) {
      const doctorProfile = await this.doctorProfileModel.findById(appointment.doctorId);
      if (doctorProfile && doctorProfile.userId.toString() === userId) {
        isDoctor = true;
      }
    }
    
    const isAuthorized = isDoctor || isPatient;
    
    if (!isAuthorized) {
      throw new ForbiddenException('You are not authorized to access this session');
    }

    return {
      sessionId: session._id,
      appointmentId: session.appointmentId,
      channelName: session.channelName,
      status: session.status,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      participants: session.participants,
      metadata: session.metadata,
    };
  }

  async endSession(appointmentId: string, userId: string): Promise<void> {
    const session = await this.videoSessionModel.findOne({ appointmentId });
    
    if (!session) {
      throw new NotFoundException('Video session not found');
    }

    // التحقق من صلاحيات إنهاء الجلسة (الطبيب فقط)
    const appointment = await this.appointmentModel.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    
    // التحقق من أن المستخدم هو الطبيب
    const doctorProfile = await this.doctorProfileModel.findById(appointment.doctorId);
    if (!doctorProfile || doctorProfile.userId.toString() !== userId) {
      throw new ForbiddenException('Only the doctor can end the session');
    }

    session.status = VideoSessionStatus.ENDED;
    session.endedAt = new Date();
    
    // تحديث بيانات المشاركين
    session.participants.forEach(participant => {
      if (!participant.leftAt) {
        participant.leftAt = new Date();
      }
    });

    // حساب مدة الجلسة
    if (session.startedAt) {
      const duration = dayjs(session.endedAt).diff(session.startedAt, 'minute');
      session.metadata = {
        ...session.metadata,
        duration,
      };
    }

    await session.save();
  }

  async joinSession(appointmentId: string, userId: string): Promise<void> {
    const session = await this.videoSessionModel.findOne({ appointmentId });
    
    if (!session) {
      throw new NotFoundException('Video session not found');
    }

    const participant = session.participants.find(
      p => p.userId.toString() === userId
    );

    if (participant) {
      participant.joinedAt = new Date();
      await session.save();
    }
  }

  async leaveSession(appointmentId: string, userId: string): Promise<void> {
    const session = await this.videoSessionModel.findOne({ appointmentId });
    
    if (!session) {
      throw new NotFoundException('Video session not found');
    }

    const participant = session.participants.find(
      p => p.userId.toString() === userId
    );

    if (participant) {
      participant.leftAt = new Date();
      await session.save();
    }
  }
}
