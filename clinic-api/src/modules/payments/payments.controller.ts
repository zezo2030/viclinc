import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { PaymentResponseDto, PaymentIntentResponseDto } from './dto/payment-response.dto';

@ApiTags('Payments')
@Controller('v1/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intent')
  @ApiOperation({ 
    summary: 'إنشاء نية دفع',
    description: 'إنشاء نية دفع وهمية للمواعيد التي تتطلب دفعاً (VIDEO/CHAT)'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'تم إنشاء نية الدفع بنجاح',
    type: PaymentIntentResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'بيانات غير صحيحة' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'الموعد غير موجود' 
  })
  @ApiBearerAuth()
  async createPaymentIntent(@Body() createDto: CreatePaymentIntentDto): Promise<PaymentIntentResponseDto> {
    return this.paymentsService.createPaymentIntent(createDto);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'استقبال webhook من مزود الدفع',
    description: 'معالجة إشعارات الدفع من مزود الدفع الخارجي'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'تم معالجة webhook بنجاح',
    type: PaymentResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'بيانات webhook غير صحيحة' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'الدفع غير موجود' 
  })
  async handleWebhook(@Body() webhookDto: PaymentWebhookDto): Promise<PaymentResponseDto> {
    return this.paymentsService.handleWebhook(webhookDto);
  }

  @Get(':appointmentId')
  @ApiOperation({ 
    summary: 'جلب حالة الدفع للموعد',
    description: 'جلب معلومات الدفع المرتبطة بالموعد'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'تم جلب معلومات الدفع بنجاح',
    type: PaymentResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'لا يوجد دفع مرتبط بهذا الموعد' 
  })
  @ApiBearerAuth()
  async getPaymentByAppointment(@Param('appointmentId') appointmentId: string): Promise<PaymentResponseDto | null> {
    return this.paymentsService.getPaymentByAppointment(appointmentId);
  }
}
