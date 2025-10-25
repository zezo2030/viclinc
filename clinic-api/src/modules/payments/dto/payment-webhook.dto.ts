import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class PaymentWebhookDto {
  @ApiProperty({ 
    description: 'Webhook event type', 
    example: 'payment.completed' 
  })
  @IsString()
  @IsNotEmpty()
  event: string;

  @ApiProperty({ 
    description: 'Webhook event data', 
    example: { paymentId: 'pi_123456789', status: 'completed' },
    type: 'object',
    additionalProperties: true
  })
  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;

  @ApiProperty({ 
    description: 'Webhook signature for verification', 
    example: 'whsec_123456789',
    required: false
  })
  @IsString()
  @IsOptional()
  signature?: string;
}
