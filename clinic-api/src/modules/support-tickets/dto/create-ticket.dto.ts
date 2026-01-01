import { IsString, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketCategory, TicketPriority } from '../schemas/support-ticket.schema';

export class CreateSupportTicketDto {
    @ApiProperty({ example: 'Problem with payment' })
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    subject: string;

    @ApiProperty({ enum: TicketCategory, example: TicketCategory.TECHNICAL })
    @IsEnum(TicketCategory)
    category: TicketCategory;

    @ApiProperty({ example: 'I tried to pay but it failed.' })
    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    description: string;

    @ApiProperty({ enum: TicketPriority, example: TicketPriority.MEDIUM, required: false })
    @IsEnum(TicketPriority)
    @IsNotEmpty()
    priority?: TicketPriority;
}
