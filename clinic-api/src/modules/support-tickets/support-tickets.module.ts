import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupportTicketsService } from './support-tickets.service';
import { SupportTicketsController } from './support-tickets.controller';
import { SupportTicket, SupportTicketSchema } from './schemas/support-ticket.schema';
import { TicketReply, TicketReplySchema } from './schemas/ticket-reply.schema';
import { GuardsModule } from '../shared/guards/guards.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: SupportTicket.name, schema: SupportTicketSchema },
            { name: TicketReply.name, schema: TicketReplySchema },
        ]),
        GuardsModule, // Required for JwtAuthGuard and RolesGuard used in SupportTicketsController
    ],
    providers: [SupportTicketsService],
    controllers: [SupportTicketsController],
    exports: [SupportTicketsService],
})
export class SupportTicketsModule { }
