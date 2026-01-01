import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TicketReplyDocument = TicketReply & Document;

export enum SenderRole {
    ADMIN = 'ADMIN',
    PATIENT = 'PATIENT',
}

@Schema({ timestamps: true })
export class TicketReply {
    @Prop({ type: Types.ObjectId, ref: 'SupportTicket', required: true })
    ticketId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    senderId: Types.ObjectId;

    @Prop({ required: true, enum: SenderRole })
    senderRole: SenderRole;

    @Prop({ required: true })
    content: string;
}

export const TicketReplySchema = SchemaFactory.createForClass(TicketReply);
