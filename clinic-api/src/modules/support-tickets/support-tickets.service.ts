import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SupportTicket, SupportTicketDocument, TicketStatus } from './schemas/support-ticket.schema';
import { TicketReply, TicketReplyDocument, SenderRole } from './schemas/ticket-reply.schema';
import { CreateSupportTicketDto } from './dto/create-ticket.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class SupportTicketsService {
    constructor(
        @InjectModel(SupportTicket.name) private ticketModel: Model<SupportTicketDocument>,
        @InjectModel(TicketReply.name) private replyModel: Model<TicketReplyDocument>,
    ) { }

    // Patient: Create a new ticket
    async createTicket(patientId: string, dto: CreateSupportTicketDto): Promise<SupportTicket> {
        const ticket = new this.ticketModel({
            ...dto,
            patientId: new Types.ObjectId(patientId),
        });
        return ticket.save();
    }

    // Patient: Get my tickets
    async getPatientTickets(patientId: string): Promise<SupportTicket[]> {
        return this.ticketModel
            .find({ patientId: new Types.ObjectId(patientId) })
            .sort({ updatedAt: -1 })
            .exec();
    }

    // Admin: Get all tickets
    async getAllTickets(): Promise<SupportTicket[]> {
        return this.ticketModel
            .find()
            .populate('patientId', 'name email phone')
            .populate('assignedAdminId', 'name email')
            .sort({ lastReplyAt: -1 })
            .exec();
    }

    // Common: Get ticket details and replies
    async getTicketDetails(ticketId: string, userId: string, isAdmin: boolean): Promise<{ ticket: SupportTicket; replies: TicketReply[] }> {
        const ticket = await this.ticketModel.findById(ticketId).exec();

        if (!ticket) {
            throw new NotFoundException('Ticket not found');
        }

        if (!isAdmin && ticket.patientId.toString() !== userId) {
            throw new ForbiddenException('You do not have permission to view this ticket');
        }

        const replies = await this.replyModel
            .find({ ticketId: new Types.ObjectId(ticketId) })
            .sort({ createdAt: 1 })
            .exec();

        return { ticket, replies };
    }

    // Common: Add a reply to a ticket
    async addReply(ticketId: string, userId: string, role: SenderRole, dto: CreateReplyDto): Promise<TicketReply> {
        const ticket = await this.ticketModel.findById(ticketId).exec();

        if (!ticket) {
            throw new NotFoundException('Ticket not found');
        }

        // Role-based access check
        if (role === SenderRole.PATIENT && ticket.patientId.toString() !== userId) {
            throw new ForbiddenException('You do not have permission to reply to this ticket');
        }

        const reply = new this.replyModel({
            ticketId: new Types.ObjectId(ticketId),
            senderId: new Types.ObjectId(userId),
            senderRole: role,
            content: dto.content,
        });

        const savedReply = await reply.save();

        // Update ticket's lastReplyAt and status if patient replied
        const updates: any = { lastReplyAt: new Date() };
        if (role === SenderRole.PATIENT && ticket.status === TicketStatus.RESOLVED) {
            updates.status = TicketStatus.IN_PROGRESS;
        }

        await this.ticketModel.findByIdAndUpdate(ticketId, updates);

        return savedReply;
    }

    // Admin: Update ticket status/priority/assignment
    async updateTicket(ticketId: string, dto: UpdateTicketDto): Promise<SupportTicket> {
        const ticket = await this.ticketModel.findByIdAndUpdate(
            ticketId,
            { ...dto },
            { new: true }
        ).exec();

        if (!ticket) {
            throw new NotFoundException('Ticket not found');
        }

        return ticket;
    }
}
