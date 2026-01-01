import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, Req, Query, Res, Redirect, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { PaymentResponseDto, PaymentIntentResponseDto } from './dto/payment-response.dto';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
  ) { }

  @Get('my-history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'جلب سجل مدفوعات المستخدم الحالي',
    description: 'يعيد قائمة بجميع عمليات الدفع الخاصة بالمستخدم المسجل دخول'
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب سجل المدفوعات بنجاح',
    type: [PaymentResponseDto]
  })
  async getMyPaymentHistory(@Req() req: any): Promise<PaymentResponseDto[]> {
    const userId = req.user.sub;
    return this.paymentsService.getPatientPayments(userId);
  }

  @Post('intent')
  @UseGuards(JwtAuthGuard)
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
  @ApiBearerAuth('JWT-auth')
  async createPaymentIntent(@Body() createDto: CreatePaymentIntentDto): Promise<PaymentIntentResponseDto> {
    return this.paymentsService.createPaymentIntent(createDto);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'استقبال webhook من مزود الدفع',
    description: 'معالجة إشعارات الدفع من Paylink. هذا endpoint لا يحتاج authentication.'
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
  // لا نستخدم @ApiBearerAuth() هنا لأن webhook لا يحتاج authentication
  async handleWebhook(
    @Body() webhookDto: PaymentWebhookDto,
    @Req() req: any,
  ): Promise<PaymentResponseDto> {
    // TODO: إضافة التحقق من توقيع Webhook في الإنتاج
    // في الإنتاج، يجب التحقق من توقيع Webhook من Paylink
    // const signature = req.headers['x-webhook-signature'] || req.headers['x-paylink-signature'];
    // if (!this.paymentsService.verifyWebhookSignature(webhookDto, signature)) {
    //   throw new UnauthorizedException('Invalid webhook signature');
    // }

    return this.paymentsService.handleWebhook(webhookDto);
  }

  @Get('webhook')
  @ApiOperation({
    summary: 'معالجة redirect من Paylink بعد الدفع',
    description: 'هذا endpoint للتعامل مع إعادة التوجيه من Paylink بعد إتمام الدفع. يعيد توجيه المستخدم إلى صفحة التأكيد.'
  })
  @ApiResponse({
    status: 302,
    description: 'إعادة توجيه إلى صفحة التأكيد'
  })
  async handleWebhookRedirect(
    @Query('orderNumber') orderNumber: string,
    @Query('transactionNo') transactionNo: string,
    @Res() res: Response,
  ) {
    // #region agent log
    console.log(`Webhook redirect received - orderNumber: ${orderNumber}, transactionNo: ${transactionNo}`);
    // #endregion

    // تنظيف orderNumber من أي تكرار (إذا كان يأتي كـ "id1,id2")
    let cleanOrderNumber = orderNumber;
    if (orderNumber && orderNumber.includes(',')) {
      // إذا كان orderNumber مكرراً، خذ الأول فقط
      cleanOrderNumber = orderNumber.split(',')[0].trim();
      console.log(`Cleaned orderNumber from "${orderNumber}" to "${cleanOrderNumber}"`);
    }

    // جلب معلومات الدفع
    let appointmentId: string | null = null;

    // محاولة البحث عن الدفع باستخدام transactionNo أولاً
    if (transactionNo) {
      try {
        const payment = await this.paymentsService.getPaymentByTransactionNo(transactionNo);
        if (payment) {
          appointmentId = payment.appointmentId.toString();
          // #region agent log
          console.log(`Found payment by transactionNo: ${transactionNo}, appointmentId: ${appointmentId}`);
          // #endregion
        }
      } catch (error: any) {
        // #region agent log
        console.error(`Failed to get payment by transactionNo: ${error?.message}`);
        // #endregion
      }
    }

    // إذا لم نجد appointmentId من transactionNo، جرب orderNumber
    if (!appointmentId && cleanOrderNumber) {
      try {
        const payment = await this.paymentsService.getPaymentByTransactionNo(cleanOrderNumber);
        if (payment) {
          appointmentId = payment.appointmentId.toString();
          // #region agent log
          console.log(`Found payment by orderNumber: ${cleanOrderNumber}, appointmentId: ${appointmentId}`);
          // #endregion
        } else {
          // إذا لم نجد payment، استخدم orderNumber مباشرة كـ appointmentId
          appointmentId = cleanOrderNumber;
          // #region agent log
          console.log(`Using orderNumber as appointmentId: ${appointmentId}`);
          // #endregion
        }
      } catch (error: any) {
        // #region agent log
        console.error(`Failed to get payment by orderNumber: ${error?.message}`);
        // #endregion
        // استخدم orderNumber مباشرة كـ appointmentId
        appointmentId = cleanOrderNumber;
      }
    }

    // ✅ التحقق الفوري من حالة الدفع وتحديث قاعدة البيانات قبل إعادة التوجيه
    // هذا يضمن تحديث حالة الدفع في قاعدة البيانات قبل وصول المستخدم لصفحة التأكيد
    if (appointmentId) {
      try {
        // استدعاء getPaymentByAppointment سيؤدي تلقائياً إلى التحقق من Paylink API
        // وتحديث حالة الدفع إذا كانت PENDING (كما هو موجود في منطق الخدمة)
        await this.paymentsService.getPaymentByAppointment(appointmentId);
        // #region agent log
        console.log(`Payment verification completed for appointmentId: ${appointmentId}`);
        // #endregion
      } catch (error: any) {
        // لا نوقف العملية إذا فشل التحقق، فقط نسجل الخطأ
        // #region agent log
        console.error(`Payment verification failed for appointmentId ${appointmentId}: ${error?.message}`);
        // #endregion
      }
    }

    // بناء URL لإعادة التوجيه
    // التحقق من متغيرات البيئة المختلفة
    let frontendUrl = this.configService.get<string>('NEXT_PUBLIC_FRONTEND_URL') ||
      this.configService.get<string>('FRONTEND_URL') ||
      this.configService.get<string>('NEXT_PUBLIC_SITE_URL') ||
      'http://localhost';

    // تنظيف الـ URL من أي حرف 'h' إضافي في البداية
    if (frontendUrl.startsWith('hhttp://') || frontendUrl.startsWith('hhttps://')) {
      frontendUrl = frontendUrl.substring(1);
    }

    // بناء URL صفحة التأكيد
    const redirectUrl = appointmentId
      ? `${frontendUrl}/appointments/confirmation?id=${appointmentId}`
      : `${frontendUrl}/appointments`;

    // #region agent log
    console.log(`Redirecting to: ${redirectUrl} (frontendUrl: ${frontendUrl}, appointmentId: ${appointmentId})`);
    // #endregion

    // إعادة التوجيه مع التأكد من استخدام 302 (Found) للـ redirect
    // استخدام res.redirect() مباشرة
    // التأكد من أن الـ URL صحيح
    if (!redirectUrl || !redirectUrl.startsWith('http')) {
      console.error(`Invalid redirect URL: ${redirectUrl}`);
      return res.status(500).json({
        error: 'Invalid redirect URL',
        redirectUrl
      });
    }

    return res.redirect(302, redirectUrl);
  }

  @Get(':appointmentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
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
    status: 200,
    description: 'لا يوجد دفع مرتبط بهذا الموعد',
    schema: { type: 'null' }
  })
  @ApiBearerAuth('JWT-auth')
  async getPaymentByAppointment(@Param('appointmentId') appointmentId: string): Promise<PaymentResponseDto | null> {
    const payment = await this.paymentsService.getPaymentByAppointment(appointmentId);
    // إرجاع null بشكل صريح لضمان إرسال response body
    return payment ?? null;
  }
}
