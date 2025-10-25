import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatSession, ChatSessionDocument, ChatSessionStatus } from '../schemas/chat-session.schema';
import { ChatMessage, ChatMessageDocument, MessageType, SenderRole } from '../schemas/chat-message.schema';
import { SendMessageDto, MessageResponseDto } from '../dto/send-message.dto';
import { ReportChatDto, ReportResponseDto } from '../dto/report-chat.dto';
import { InjectModel as InjectAppointmentModel } from '@nestjs/mongoose';
import { Appointment, AppointmentStatus } from '../../schedule/schemas/appointment.schema';
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
  ) {}

  async getChatSession(appointmentId: string, userId: string): Promise<any> {
    const appointment = await this.appointmentModel.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // التحقق من صلاحيات الوصول
    const isAuthorized = appointment.doctorId.toString() === userId || 
                        appointment.patientId.toString() === userId;
    
    if (!isAuthorized) {
      throw new ForbiddenException('You are not authorized to access this chat');
    }

    let session = await this.chatSessionModel.findOne({ appointmentId });
    
    if (!session) {
      // إنشاء جلسة دردشة جديدة
      const expiresAt = dayjs(appointment.startAt).add(appointment.duration, 'minute').toDate();
      
      session = new this.chatSessionModel({
        appointmentId,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        status: ChatSessionStatus.ACTIVE,
        expiresAt,
        messageCount: 0,
      });
      await session.save();
    }

    // التحقق من انتهاء صلاحية الجلسة
    if (dayjs().isAfter(session.expiresAt)) {
      session.status = ChatSessionStatus.EXPIRED;
      await session.save();
    }

    return {
      sessionId: session._id,
      appointmentId: session.appointmentId,
      status: session.status,
      expiresAt: session.expiresAt,
      messageCount: session.messageCount,
      lastMessageAt: session.lastMessageAt,
    };
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

    const skip = (page - 1) * limit;
    
    const messages = await this.chatMessageModel
      .find({ sessionId: session.sessionId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'name email')
      .lean();

    const total = await this.chatMessageModel.countDocuments({ sessionId: session.sessionId });
    
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
    const appointment = await this.appointmentModel.findById(appointmentId);
    const senderRole = appointment.doctorId.toString() === userId ? SenderRole.DOCTOR : SenderRole.PATIENT;

    // إنشاء الرسالة
    const message = new this.chatMessageModel({
      sessionId: session.sessionId,
      senderId: userId,
      senderRole,
      content: messageDto.content,
      type: messageDto.type || MessageType.TEXT,
      replyTo: messageDto.replyTo ? new (require('mongoose')).Types.ObjectId(messageDto.replyTo) : undefined,
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
    const appointment = await this.appointmentModel.findById(appointmentId);
    const userRole = appointment.doctorId.toString() === userId ? SenderRole.DOCTOR : SenderRole.PATIENT;
    
    // تحديد الرسائل التي لم يقرأها المستخدم
    const otherRole = userRole === SenderRole.DOCTOR ? SenderRole.PATIENT : SenderRole.DOCTOR;
    
    await this.chatMessageModel.updateMany(
      { 
        sessionId: session.sessionId,
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
    const appointment = await this.appointmentModel.findById(appointmentId);
    const userRole = appointment.doctorId.toString() === userId ? SenderRole.DOCTOR : SenderRole.PATIENT;
    const otherRole = userRole === SenderRole.DOCTOR ? SenderRole.PATIENT : SenderRole.DOCTOR;
    
    return this.chatMessageModel.countDocuments({
      sessionId: session.sessionId,
      senderRole: otherRole,
      isRead: false,
    });
  }
}
