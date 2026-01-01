import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SupportTicketDocument = SupportTicket & Document;

export enum TicketStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED',
}

export enum TicketPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

export enum TicketCategory {
    TECHNICAL = 'TECHNICAL',
    BILLING = 'BILLING',
    MEDICAL = 'MEDICAL',
    OTHER = 'OTHER',
}

@Schema({ timestamps: true })
export class SupportTicket {
    @Prop({ required: true })
    subject: string;

    @Prop({ required: true, enum: TicketCategory })
    category: TicketCategory;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true, enum: TicketStatus, default: TicketStatus.OPEN })
    status: TicketStatus;

    @Prop({ required: true, enum: TicketPriority, default: TicketPriority.MEDIUM })
    priority: TicketPriority;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    patientId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    assignedAdminId: Types.ObjectId;

    @Prop({ default: Date.now })
    lastReplyAt: Date;
}

export const SupportTicketSchema = SchemaFactory.createForClass(SupportTicket);
