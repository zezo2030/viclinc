import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatSession, ChatSessionDocument, ChatSessionStatus } from '../schemas/chat-session.schema';
import { ChatMessage, ChatMessageDocument, MessageType, SenderRole } from '../schemas/chat-message.schema';
import { SendMessageDto, MessageResponseDto } from '../dto/send-message.dto';
import { ReportChatDto, ReportResponseDto } from '../dto/report-chat.dto';
import { InjectModel as InjectAppointmentModel } from '@nestjs/mongoose';
import { Appointment, AppointmentStatus } from '../../schedule/schemas/appointment.schema';
import { DoctorProfile, DoctorProfileDocument } from '../../doctors/schemas/doctor-profile.schema';
import dayjs from 'dayjs';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatSession.name) 
    private chatSessionModel: Model<ChatSessionDocument>,
    @InjectModel(ChatMessage.name) 
    private chatMessageModel: Model<ChatMessageDocument>,
    @InjectAppointmentModel(Appointment.name) 
    private appointmentModel: Model<any>,
    @InjectModel(DoctorProfile.name)
    private doctorProfileModel: Model<DoctorProfileDocument>,
  ) {}

  /**
   * Helper method to determine user role for an appointment
   * Returns 'doctor' if user is the doctor, 'patient' if user is the patient, null otherwise
   */
  private async getUserRoleForAppointment(appointmentId: string, userId: string): Promise<'doctor' | 'patient' | null> {
    const appointment = await this.appointmentModel.findById(appointmentId);
    if (!appointment) {
      return null;
    }

    // Check if user is the patient
    if (appointment.patientId?.toString() === userId) {
      return 'patient';
    }

    // Check if user is the doctor
    if (appointment.doctorId) {
      const doctorProfile = await this.doctorProfileModel.findById(appointment.doctorId);
      if (doctorProfile && doctorProfile.userId?.toString() === userId) {
        return 'doctor';
      }
    }

    return null;
  }

  async getChatSession(appointmentId: string, userId: string): Promise<any> {
    try {
      // Validate and convert appointmentId to ObjectId
      let appointmentObjectId: Types.ObjectId;
      try {
        appointmentObjectId = new Types.ObjectId(appointmentId);
      } catch (error) {
        throw new BadRequestException(`Invalid appointment ID: ${appointmentId}`);
      }

      const appointment = await this.appointmentModel.findById(appointmentObjectId);
      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }

      // التحقق من صلاحيات الوصول
      // patientId يشير مباشرة إلى User._id
      const isPatient = appointment.patientId?.toString() === userId;
      
      // doctorId يشير إلى DoctorProfile._id، لذا نحتاج للتحقق من DoctorProfile.userId
      let isDoctor = false;
      if (!isPatient && appointment.doctorId) {
        const doctorProfile = await this.doctorProfileModel.findById(appointment.doctorId);
        if (doctorProfile && doctorProfile.userId?.toString() === userId) {
          isDoctor = true;
        }
      }
      
      if (!isDoctor && !isPatient) {
        throw new ForbiddenException('You are not authorized to access this chat');
      }

      let session = await this.chatSessionModel.findOne({ appointmentId: appointmentObjectId });
      
      if (!session) {
        // إنشاء جلسة دردشة جديدة
        if (!appointment.startAt) {
          throw new BadRequestException('Appointment start time is not set');
        }
        
        const duration = appointment.duration || 30; // Default to 30 minutes if not set
        let startAt: Date;
        try {
          startAt = appointment.startAt instanceof Date 
            ? appointment.startAt 
            : new Date(appointment.startAt);
          
          // Validate that the date is valid
          if (isNaN(startAt.getTime())) {
            throw new BadRequestException('Invalid appointment start time format');
          }
        } catch (error: any) {
          if (error instanceof BadRequestException) {
            throw error;
          }
          throw new BadRequestException(`Invalid appointment start time: ${error?.message || 'Unknown error'}`);
        }
        
        const expiresAt = dayjs(startAt).add(duration, 'minute').toDate();
        
        // Get doctor's User ID from DoctorProfile
        let doctorUserId: Types.ObjectId;
        if (appointment.doctorId) {
          const doctorProfile = await this.doctorProfileModel.findById(appointment.doctorId);
          if (!doctorProfile || !doctorProfile.userId) {
            throw new BadRequestException('Doctor profile not found or invalid');
          }
          doctorUserId = doctorProfile.userId instanceof Types.ObjectId 
            ? doctorProfile.userId 
            : new Types.ObjectId(doctorProfile.userId);
        } else {
          throw new BadRequestException('Appointment doctor ID is missing');
        }

        // Validate and convert patientId
        if (!appointment.patientId) {
          throw new BadRequestException('Appointment patient ID is missing');
        }
        const patientId = appointment.patientId instanceof Types.ObjectId 
          ? appointment.patientId 
          : new Types.ObjectId(appointment.patientId);
        
        try {
          session = new this.chatSessionModel({
            appointmentId: appointmentObjectId,
            doctorId: doctorUserId,
            patientId: patientId,
            status: ChatSessionStatus.ACTIVE,
            expiresAt,
            messageCount: 0,
          });
          await session.save();
        } catch (saveError: any) {
          // If session already exists (race condition), fetch it
          if (saveError.code === 11000) {
            session = await this.chatSessionModel.findOne({ appointmentId: appointmentObjectId });
          } else {
            throw saveError;
          }
        }
      }

      // في هذه المرحلة يجب أن تكون الجلسة موجودة دائمًا،
      // لكن للتحقق الإضافي والتوافق مع TypeScript نضيف فحصًا صريحًا
      if (!session) {
        throw new NotFoundException('Chat session not found');
      }

      // التحقق من انتهاء صلاحية الجلسة
      if (session.expiresAt && dayjs().isAfter(session.expiresAt)) {
        session.status = ChatSessionStatus.EXPIRED;
        await session.save();
      }

      return {
        sessionId: session._id ? (session._id instanceof Types.ObjectId ? session._id.toString() : String(session._id)) : null,
        appointmentId: session.appointmentId ? (session.appointmentId instanceof Types.ObjectId ? session.appointmentId.toString() : String(session.appointmentId)) : null,
        status: session.status,
        expiresAt: session.expiresAt,
        messageCount: session.messageCount || 0,
        lastMessageAt: session.lastMessageAt || null,
      };
    } catch (error: any) {
      // Re-throw known exceptions as-is
      if (error instanceof NotFoundException || 
          error instanceof ForbiddenException || 
          error instanceof BadRequestException) {
        throw error;
      }
      
      // Log the full error for debugging
      console.error('Error in getChatSession:', error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      console.error('AppointmentId:', appointmentId);
      console.error('UserId:', userId);
      
      // For unknown errors, throw a more descriptive error
      // This helps identify the root cause
      throw new BadRequestException(
        `Failed to get chat session: ${error?.message || 'Unknown error'}`
      );
    }
  }

  async getMessages(
    appointmentId: string, 
    userId: string, 
    page: number = 1, 
    limit: number = 50
  ): Promise<{ messages: MessageResponseDto[]; total: number; hasMore: boolean }> {
    const session = await this.getChatSession(appointmentId, userId);
    
    if (session.status === ChatSessionStatus.EXPIRED) {
      throw new BadRequestException('Chat session has expired');
    }

    if (!session.sessionId) {
      throw new NotFoundException('Chat session ID not found');
    }

    // Convert sessionId string to ObjectId for querying
    const sessionObjectId = new Types.ObjectId(session.sessionId);
    const skip = (page - 1) * limit;
    
    const messages = await this.chatMessageModel
      .find({ sessionId: sessionObjectId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'name email')
      .lean();

    const total = await this.chatMessageModel.countDocuments({ sessionId: sessionObjectId });
    
    const messageResponses: MessageResponseDto[] = messages.map(msg => ({
      id: msg._id.toString(),
      sessionId: msg.sessionId.toString(),
      senderId: msg.senderId.toString(),
      senderRole: msg.senderRole,
      content: msg.content,
      type: msg.type,
      isRead: msg.isRead,
      createdAt: (msg as any).createdAt,
      replyTo: msg.replyTo?.toString(),
      attachments: msg.attachments,
    }));

    return {
      messages: messageResponses.reverse(), // ترتيب من الأقدم للأحدث
      total,
      hasMore: skip + limit < total,
    };
  }

  async sendMessage(
    appointmentId: string, 
    userId: string, 
    messageDto: SendMessageDto
  ): Promise<MessageResponseDto> {
    const session = await this.getChatSession(appointmentId, userId);
    
    if (session.status !== ChatSessionStatus.ACTIVE) {
      throw new BadRequestException('Chat session is not active');
    }

    // التحقق من انتهاء صلاحية الجلسة
    if (dayjs().isAfter(session.expiresAt)) {
      session.status = ChatSessionStatus.EXPIRED;
      await this.chatSessionModel.findByIdAndUpdate(session.sessionId, { status: ChatSessionStatus.EXPIRED });
      throw new BadRequestException('Chat session has expired');
    }

    // تحديد دور المرسل
    const userRole = await this.getUserRoleForAppointment(appointmentId, userId);
    if (!userRole) {
      throw new ForbiddenException('You are not authorized to send messages to this chat');
    }
    const senderRole = userRole === 'doctor' ? SenderRole.DOCTOR : SenderRole.PATIENT;

    // Convert sessionId to ObjectId
    if (!session.sessionId) {
      throw new NotFoundException('Chat session ID not found');
    }
    const sessionObjectId = new Types.ObjectId(session.sessionId);

    // إنشاء الرسالة
    const message = new this.chatMessageModel({
      sessionId: sessionObjectId,
      senderId: userId,
      senderRole,
      content: messageDto.content,
      type: messageDto.type || MessageType.TEXT,
      replyTo: messageDto.replyTo ? new Types.ObjectId(messageDto.replyTo) : undefined,
      attachments: messageDto.attachments,
    });

    await message.save();

    // تحديث إحصائيات الجلسة
    await this.chatSessionModel.findByIdAndUpdate(session.sessionId, {
      $inc: { messageCount: 1 },
      lastMessageAt: new Date(),
    });

    return {
      id: (message as any)._id.toString(),
      sessionId: message.sessionId.toString(),
      senderId: message.senderId.toString(),
      senderRole: message.senderRole,
      content: message.content,
      type: message.type,
      isRead: message.isRead,
      createdAt: (message as any).createdAt,
      replyTo: message.replyTo?.toString(),
      attachments: message.attachments,
    };
  }

  async markAsRead(appointmentId: string, userId: string): Promise<void> {
    const session = await this.getChatSession(appointmentId, userId);
    
    // تحديد دور المستخدم
    const userRoleStr = await this.getUserRoleForAppointment(appointmentId, userId);
    if (!userRoleStr) {
      throw new ForbiddenException('You are not authorized to access this chat');
    }
    const userRole = userRoleStr === 'doctor' ? SenderRole.DOCTOR : SenderRole.PATIENT;
    
    // تحديد الرسائل التي لم يقرأها المستخدم
    const otherRole = userRole === SenderRole.DOCTOR ? SenderRole.PATIENT : SenderRole.DOCTOR;
    
    // Convert sessionId to ObjectId
    if (!session.sessionId) {
      throw new NotFoundException('Chat session ID not found');
    }
    const sessionObjectId = new Types.ObjectId(session.sessionId);
    
    await this.chatMessageModel.updateMany(
      { 
        sessionId: sessionObjectId,
        senderRole: otherRole,
        isRead: false 
      },
      { 
        isRead: true,
        readAt: new Date()
      }
    );
  }

  async archiveChat(appointmentId: string, userId: string): Promise<void> {
    const session = await this.getChatSession(appointmentId, userId);
    
    if (session.status === ChatSessionStatus.ARCHIVED) {
      throw new BadRequestException('Chat is already archived');
    }

    await this.chatSessionModel.findByIdAndUpdate(session.sessionId, {
      status: ChatSessionStatus.ARCHIVED,
      archivedAt: new Date(),
      archivedBy: userId,
    });
  }

  async reportChat(
    appointmentId: string, 
    userId: string, 
    reportDto: ReportChatDto
  ): Promise<ReportResponseDto> {
    const session = await this.getChatSession(appointmentId, userId);
    
    // إنشاء تقرير (يمكن تخزينه في جدول منفصل)
    const reportId = new (require('mongoose')).Types.ObjectId().toString();
    
    // هنا يمكن إضافة منطق إضافي للتعامل مع التقارير
    // مثل إشعار الأدمن أو حظر المستخدم
    
    return {
      reportId,
      status: 'submitted',
      createdAt: new Date(),
    };
  }

  async getUnreadCount(appointmentId: string, userId: string): Promise<number> {
    const session = await this.getChatSession(appointmentId, userId);
    
    // تحديد دور المستخدم
    const userRoleStr = await this.getUserRoleForAppointment(appointmentId, userId);
    if (!userRoleStr) {
      throw new ForbiddenException('You are not authorized to access this chat');
    }
    const userRole = userRoleStr === 'doctor' ? SenderRole.DOCTOR : SenderRole.PATIENT;
    const otherRole = userRole === SenderRole.DOCTOR ? SenderRole.PATIENT : SenderRole.DOCTOR;
    
    // Convert sessionId to ObjectId
    if (!session.sessionId) {
      throw new NotFoundException('Chat session ID not found');
    }
    const sessionObjectId = new Types.ObjectId(session.sessionId);
    
    return this.chatMessageModel.countDocuments({
      sessionId: sessionObjectId,
      senderRole: otherRole,
      isRead: false,
    });
  }
}
