import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus, TicketPriority } from '../schemas/support-ticket.schema';

export class UpdateTicketDto {
    @ApiProperty({ enum: TicketStatus, required: false })
    @IsEnum(TicketStatus)
    @IsOptional()
    status?: TicketStatus;

    @ApiProperty({ enum: TicketPriority, required: false })
    @IsEnum(TicketPriority)
    @IsOptional()
    priority?: TicketPriority;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    assignedAdminId?: string;
}
