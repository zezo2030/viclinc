import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VideoSession, VideoSessionDocument, VideoSessionStatus, ParticipantRole } from '../schemas/video-session.schema';
import { AgoraService, AgoraTokenRequest } from './agora.service';
import { RequestVideoTokenDto, VideoTokenResponseDto } from '../dto/request-video-token.dto';
import { InjectModel as InjectAppointmentModel } from '@nestjs/mongoose';
import { Appointment, AppointmentStatus } from '../../schedule/schemas/appointment.schema';
import dayjs from 'dayjs';

@Injectable()
export class VideoSessionService {
  constructor(
    @InjectModel(VideoSession.name) 
    private videoSessionModel: Model<VideoSessionDocument>,
    @InjectAppointmentModel(Appointment.name) 
    private appointmentModel: Model<any>,
    private readonly agoraService: AgoraService,
  ) {}

  async requestVideoToken(
    requestDto: RequestVideoTokenDto, 
    userId: string
  ): Promise<VideoTokenResponseDto> {
    // التحقق من وجود الموعد
    const appointment = await this.appointmentModel.findById(requestDto.appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // التحقق من حالة الموعد
    if (appointment.status !== AppointmentStatus.CONFIRMED) {
      throw new BadRequestException('Appointment must be confirmed to start video session');
    }

    // التحقق من نوع الموعد
    if (appointment.type !== 'VIDEO') {
      throw new BadRequestException('This appointment does not support video sessions');
    }

    // التحقق من صلاحيات المستخدم
    const isDoctor = appointment.doctorId.toString() === userId;
    const isPatient = appointment.patientId.toString() === userId;
    
    if (!isDoctor && !isPatient) {
      throw new ForbiddenException('You are not authorized to access this appointment');
    }

    // التحقق من الدور المطلوب
    const expectedRole = isDoctor ? 'doctor' : 'patient';
    if (requestDto.role !== expectedRole) {
      throw new BadRequestException(`Invalid role. Expected: ${expectedRole}`);
    }

    // فحص غرفة الانتظار (T-10m)
    const appointmentStart = dayjs(appointment.startAt);
    const now = dayjs();
    const timeUntilStart = appointmentStart.diff(now, 'minute');
    
    if (timeUntilStart > 10) {
      throw new BadRequestException(
        `Video session is not available yet. Please wait ${timeUntilStart - 10} more minutes.`
      );
    }

    // التحقق من انتهاء الموعد
    if (now.isAfter(appointmentStart.add(appointment.duration, 'minute'))) {
      throw new BadRequestException('Appointment time has ended');
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

    const isAuthorized = appointment.doctorId.toString() === userId || 
                        appointment.patientId.toString() === userId;
    
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
    if (appointment.doctorId.toString() !== userId) {
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
