import { Controller, Get, Post, Body, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupportTicketsService } from './support-tickets.service';
import { CreateSupportTicketDto } from './dto/create-ticket.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { SenderRole } from './schemas/ticket-reply.schema';

@ApiTags('Support Tickets')
@Controller('support-tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class SupportTicketsController {
    constructor(private readonly ticketsService: SupportTicketsService) { }

    // --- Patient Endpoints ---

    @Post()
    @Roles('PATIENT')
    @ApiOperation({ summary: 'Create a new support ticket (Patient)' })
    createTicket(@Req() req: any, @Body() dto: CreateSupportTicketDto) {
        return this.ticketsService.createTicket(req.user.sub, dto);
    }

    @Get('my-tickets')
    @Roles('PATIENT')
    @ApiOperation({ summary: 'Get my support tickets (Patient)' })
    getMyTickets(@Req() req: any) {
        return this.ticketsService.getPatientTickets(req.user.sub);
    }

    // --- Admin Endpoints ---

    @Get()
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Get all support tickets (Admin)' })
    getAllTickets() {
        return this.ticketsService.getAllTickets();
    }

    @Patch(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Update ticket status/priority/assignment (Admin)' })
    updateTicket(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
        return this.ticketsService.updateTicket(id, dto);
    }

    // --- Common Endpoints ---

    @Get(':id')
    @ApiOperation({ summary: 'Get ticket details and replies' })
    getTicketDetails(@Param('id') id: string, @Req() req: any) {
        const isAdmin = req.user.role === 'ADMIN';
        return this.ticketsService.getTicketDetails(id, req.user.sub, isAdmin);
    }

    @Post(':id/replies')
    @ApiOperation({ summary: 'Add a reply to a ticket' })
    addReply(@Param('id') id: string, @Req() req: any, @Body() dto: CreateReplyDto) {
        const role = req.user.role === 'ADMIN' ? SenderRole.ADMIN : SenderRole.PATIENT;
        return this.ticketsService.addReply(id, req.user.sub, role, dto);
    }
}
