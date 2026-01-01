import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReplyDto {
    @ApiProperty({ example: 'Thank you for your response.' })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    content: string;
}
