import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({ 
    description: 'Appointment ID to create payment for', 
    example: '64f1a2b3c4d5e6f7g8h9i0j1' 
  })
  @IsMongoId()
  @IsNotEmpty()
  appointmentId: string;
}
