import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentDocument, PaymentStatus, PaymentMethod } from './schemas/payment.schema';
import { Appointment, AppointmentDocument } from '../schedule/schemas/appointment.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { PaymentResponseDto, PaymentIntentResponseDto } from './dto/payment-response.dto';
import { AppointmentService } from '../schedule/services/appointment.service';
import { PaylinkService } from './services/paylink.service';
import { RedisService } from '../shared/redis/redis.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly appointmentService: AppointmentService,
    private readonly paylinkService: PaylinkService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) { }

  /**
   * إنشاء نية دفع عبر Paylink
   * يدعم الآن appointmentId (للمواعيد الموجودة) أو reservationId (للحجوزات المؤقتة)
   */
  async createPaymentIntent(createDto: CreatePaymentIntentDto): Promise<PaymentIntentResponseDto> {
    const { appointmentId } = createDto;

    this.logger.log(`Creating payment intent for ID: ${appointmentId}`);

    // محاولة جلب reservation أولاً (إذا كان reservationId)
    const reservationKey = `reservation:${appointmentId}`;
    this.logger.log(`Looking for reservation with key: ${reservationKey}`);
    
    let reservationDataStr: string | null = null;
    try {
      reservationDataStr = await this.redisService.getIdempotencyKey(reservationKey);
      this.logger.log(`Reservation data from Redis: ${reservationDataStr ? 'FOUND' : 'NOT FOUND'}`);
      if (reservationDataStr) {
        this.logger.log(`Reservation data length: ${reservationDataStr.length} characters`);
      }
    } catch (error) {
      this.logger.error(`Failed to check Redis for reservation: ${error.message}`, error.stack);
      // نستمر في البحث عن appointment حتى لو فشل Redis
      reservationDataStr = null;
    }
    
    let appointment: any = null;
    let isReservation = false;
    let reservationData: any = null;

    if (reservationDataStr) {
      // هذا reservation
      isReservation = true;
      try {
        reservationData = JSON.parse(reservationDataStr);
      } catch (error) {
        this.logger.error(`Failed to parse reservation data: ${error.message}`);
        throw new BadRequestException('Invalid reservation data format');
      }

      // جلب بيانات المريض من User model (نحتاج إلى UserService أو طريقة أخرى)
      // للآن سنستخدم البيانات من reservation
      const patientId = reservationData.patientId;

      // التحقق من وجود دفع سابق لهذا reservation
      const existingPayment = await this.paymentModel.findOne({
        'metadata.reservationId': appointmentId,
      });

      if (existingPayment && existingPayment.status === PaymentStatus.COMPLETED && existingPayment.intentId) {
        return {
          intentId: existingPayment.intentId,
          clientSecret: '',
          amount: existingPayment.amount,
          currency: existingPayment.currency,
          status: existingPayment.status,
        };
      }

      if (existingPayment && existingPayment.status === PaymentStatus.PENDING && existingPayment.intentId) {
        return {
          intentId: existingPayment.intentId,
          clientSecret: '',
          amount: existingPayment.amount,
          currency: existingPayment.currency,
          status: existingPayment.status,
        };
      }

      // استخدام بيانات reservation
      const amount = reservationData.price || 0;
      if (amount <= 0) {
        throw new BadRequestException('Invalid reservation amount');
      }

      // جلب بيانات المريض من قاعدة البيانات
      this.logger.log(`Fetching patient data for ID: ${reservationData.patientId}`);
      let patient: any = null;
      try {
        patient = await this.userModel.findById(reservationData.patientId).lean();
        if (!patient) {
          this.logger.error(`Patient not found for ID: ${reservationData.patientId}`);
          throw new NotFoundException('Patient not found');
        }
        this.logger.log(`Patient found: ${patient.name || 'Unknown'}, Phone: ${patient.phone || 'N/A'}`);
      } catch (error) {
        this.logger.error(`Error fetching patient: ${error.message}`, error.stack);
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new BadRequestException(`Failed to fetch patient data: ${error.message}`);
      }

      const clientName = patient.name || 'Patient';
      const clientMobile = patient.phone || '';

      if (!clientMobile) {
        this.logger.error(`Patient ${reservationData.patientId} does not have a phone number`);
        throw new BadRequestException('Patient phone number is required for payment');
      }

      const orderNumber = appointmentId;

      // بناء URLs
      const callbackBaseUrl = this.configService.get<string>('CALLBACK_BASE_URL') ||
        this.configService.get<string>('NEXT_PUBLIC_API_URL') ||
        this.configService.get<string>('VITE_API_URL') ||
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost';

      const hasApiPrefix = callbackBaseUrl.includes('/api');
      const callBackUrl = hasApiPrefix
        ? `${callbackBaseUrl}/payments/webhook?orderNumber=${appointmentId}`
        : `${callbackBaseUrl}/v1/payments/webhook?orderNumber=${appointmentId}`;

      let frontendUrl = this.configService.get<string>('NEXT_PUBLIC_FRONTEND_URL') ||
        this.configService.get<string>('FRONTEND_URL') ||
        this.configService.get<string>('NEXT_PUBLIC_SITE_URL') ||
        'http://localhost';

      if (frontendUrl.startsWith('hhttp://') || frontendUrl.startsWith('hhttps://')) {
        frontendUrl = frontendUrl.substring(1);
      }

      const successUrl = `${frontendUrl}/appointments/confirmation?id=${appointmentId}`;
      const cancelUrl = `${frontendUrl}/appointments/${appointmentId}/payment?canceled=true`;

      this.logger.log(`Creating Paylink invoice for reservation ${appointmentId}, amount: ${amount}`);
      this.logger.log(`Paylink invoice details: clientName=${clientName}, clientMobile=${clientMobile}, orderNumber=${orderNumber}`);

      let invoice: any;
      try {
        invoice = await this.paylinkService.createInvoice({
          amount,
          clientName,
          clientMobile,
          orderNumber,
          description: `Booking for ${reservationData.type} appointment`,
          callBackUrl,
          successUrl,
          cancelUrl,
        });
        this.logger.log(`Paylink invoice created successfully: transactionNo=${invoice.transactionNo}`);
      } catch (error) {
        this.logger.error(`Failed to create Paylink invoice: ${error.message}`, error.stack);
        throw new BadRequestException(`Failed to create payment invoice: ${error.message}`);
      }

      const transactionNo = invoice.transactionNo;

      // حفظ سجل الدفع مع reservationId في metadata
      // لا نضع appointmentId لأن الـ appointment لم يُنشأ بعد (سيتم إنشاؤه بعد إتمام الدفع)
      const payment = new this.paymentModel({
        // appointmentId غير موجود بعد - سيتم تعيينه بعد إنشاء الـ appointment من الـ reservation
        amount,
        currency: 'SAR',
        status: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        intentId: transactionNo,
        metadata: {
          provider: 'paylink',
          orderNumber,
          paylinkInvoiceUrl: invoice.url,
          reservationId: appointmentId,
          patientId: reservationData.patientId,
          doctorId: reservationData.doctorId,
          serviceId: reservationData.serviceId,
          startAt: reservationData.startAt,
          endAt: reservationData.endAt,
          type: reservationData.type,
        }
      }) as PaymentDocument;
      await payment.save();

      this.logger.log(`Payment intent created successfully for reservation - TransactionNo: ${transactionNo}`);

      return {
        intentId: transactionNo,
        clientSecret: '',
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
      };
    }

    // إذا لم يكن reservation، جرب كـ appointment
    // التحقق إذا كان ID من نوع ObjectId صالح قبل البحث
    const isValidObjectId = Types.ObjectId.isValid(appointmentId) &&
      appointmentId.length === 24;

    if (!isValidObjectId) {
      // الـ ID ليس ObjectId صالح وليس reservation موجود
      // قد يكون reservation انتهت صلاحيته أو غير موجود
      this.logger.warn(`Invalid appointment ID format: ${appointmentId}. Not a valid ObjectId and no reservation found.`);
      this.logger.warn(`Attempted to find reservation with key: reservation:${appointmentId}`);
      
      // محاولة البحث مرة أخرى في Redis للتأكد
      try {
        const retryReservation = await this.redisService.getIdempotencyKey(`reservation:${appointmentId}`);
        if (retryReservation) {
          this.logger.log(`Reservation found on retry! Processing...`);
          // إعادة معالجة الـ reservation
          reservationDataStr = retryReservation;
          // إعادة معالجة الـ reservation
          try {
            reservationData = JSON.parse(retryReservation);
            // الانتقال إلى معالجة الـ reservation
            // سنعيد تنفيذ الكود من بداية معالجة الـ reservation
            const patientId = reservationData.patientId;
            const existingPayment = await this.paymentModel.findOne({
              'metadata.reservationId': appointmentId,
            });

            if (existingPayment && existingPayment.status === PaymentStatus.COMPLETED && existingPayment.intentId) {
              return {
                intentId: existingPayment.intentId,
                clientSecret: '',
                amount: existingPayment.amount,
                currency: existingPayment.currency,
                status: existingPayment.status,
              };
            }

            if (existingPayment && existingPayment.status === PaymentStatus.PENDING && existingPayment.intentId) {
              return {
                intentId: existingPayment.intentId,
                clientSecret: '',
                amount: existingPayment.amount,
                currency: existingPayment.currency,
                status: existingPayment.status,
              };
            }

            const amount = reservationData.price || 0;
            if (amount <= 0) {
              throw new BadRequestException('Invalid reservation amount');
            }

            const patient = await this.userModel.findById(reservationData.patientId).lean();
            if (!patient) {
              throw new NotFoundException('Patient not found');
            }

            const clientName = patient.name || 'Patient';
            const clientMobile = patient.phone || '';

            if (!clientMobile) {
              throw new BadRequestException('Patient phone number is required for payment');
            }

            const orderNumber = appointmentId;
            const callbackBaseUrl = this.configService.get<string>('CALLBACK_BASE_URL') ||
              this.configService.get<string>('NEXT_PUBLIC_API_URL') ||
              this.configService.get<string>('VITE_API_URL') ||
              this.configService.get<string>('FRONTEND_URL') ||
              'http://localhost';

            const hasApiPrefix = callbackBaseUrl.includes('/api');
            const callBackUrl = hasApiPrefix
              ? `${callbackBaseUrl}/payments/webhook?orderNumber=${appointmentId}`
              : `${callbackBaseUrl}/v1/payments/webhook?orderNumber=${appointmentId}`;

            let frontendUrl = this.configService.get<string>('NEXT_PUBLIC_FRONTEND_URL') ||
              this.configService.get<string>('FRONTEND_URL') ||
              this.configService.get<string>('NEXT_PUBLIC_SITE_URL') ||
              'http://localhost';

            if (frontendUrl.startsWith('hhttp://') || frontendUrl.startsWith('hhttps://')) {
              frontendUrl = frontendUrl.substring(1);
            }

            const successUrl = `${frontendUrl}/appointments/confirmation?id=${appointmentId}`;
            const cancelUrl = `${frontendUrl}/appointments/${appointmentId}/payment?canceled=true`;

            const invoice = await this.paylinkService.createInvoice({
              amount,
              clientName,
              clientMobile,
              orderNumber,
              description: `Booking for ${reservationData.type} appointment`,
              callBackUrl,
              successUrl,
              cancelUrl,
            });

            const transactionNo = invoice.transactionNo;

            // لا نضع appointmentId لأن الـ appointment لم يُنشأ بعد
            const payment = new this.paymentModel({
              amount,
              currency: 'SAR',
              status: PaymentStatus.PENDING,
              paymentMethod: PaymentMethod.CREDIT_CARD,
              intentId: transactionNo,
              metadata: {
                provider: 'paylink',
                orderNumber,
                paylinkInvoiceUrl: invoice.url,
                reservationId: appointmentId,
                patientId: reservationData.patientId,
                doctorId: reservationData.doctorId,
                serviceId: reservationData.serviceId,
                startAt: reservationData.startAt,
                endAt: reservationData.endAt,
                type: reservationData.type,
              }
            }) as PaymentDocument;
            await payment.save();

            return {
              intentId: transactionNo,
              clientSecret: '',
              amount: payment.amount,
              currency: payment.currency,
              status: payment.status,
            };
          } catch (parseError) {
            this.logger.error(`Failed to process retry reservation: ${parseError.message}`, parseError.stack);
            throw new BadRequestException(`Failed to process reservation: ${parseError.message}`);
          }
        } else {
          throw new NotFoundException(`Appointment or reservation not found. The reservation may have expired (TTL: 30 minutes) or the ID is invalid.`);
        }
      } catch (retryError) {
        this.logger.error(`Retry failed: ${retryError.message}`, retryError.stack);
        if (retryError instanceof NotFoundException || retryError instanceof BadRequestException) {
          throw retryError;
        }
        throw new NotFoundException(`Appointment or reservation not found. The reservation may have expired (TTL: 30 minutes) or the ID is invalid.`);
      }
    }

    appointment = await this.appointmentModel
      .findById(appointmentId)
      .populate('patientId', 'name phone email')
      .lean();

    if (!appointment) {
      throw new NotFoundException('Appointment or reservation not found');
    }

    // التحقق من وجود دفع سابق
    const existingPayment = await this.paymentModel.findOne({
      appointmentId: new Types.ObjectId(appointmentId),
    });

    // إذا كان الدفع مكتمل لا ننشئ نية دفع جديدة
    if (existingPayment && existingPayment.status === PaymentStatus.COMPLETED && existingPayment.intentId) {
      return {
        intentId: existingPayment.intentId,
        clientSecret: '', // Not used in Paylink flow
        amount: existingPayment.amount,
        currency: existingPayment.currency,
        status: existingPayment.status,
      };
    }

    // إذا كان الدفع Pending ومعه intentId نعيد نفس النية (جلسة دفع جارية)
    if (existingPayment && existingPayment.status === PaymentStatus.PENDING && existingPayment.intentId) {
      return {
        intentId: existingPayment.intentId,
        clientSecret: '',
        amount: existingPayment.amount,
        currency: existingPayment.currency,
        status: existingPayment.status,
      };
    }

    // إنشاء نية دفع عبر Paylink
    try {
      // 1. حساب السعر
      const amount = appointment.price || 0;
      if (amount <= 0) {
        throw new BadRequestException('Invalid appointment amount');
      }

      // 2. جلب بيانات المريض
      const patient = appointment.patientId as any;
      if (!patient) {
        throw new BadRequestException('Patient information not found');
      }

      const clientName = patient.name || 'Patient';
      const clientMobile = patient.phone || '';

      if (!clientMobile) {
        throw new BadRequestException('Patient phone number is required for payment');
      }

      const orderNumber = appointmentId;

      // 3. بناء URLs
      // Paylink يستخدم callBackUrl لإعادة توجيه المستخدم بعد الدفع
      // لذلك يجب أن يكون GET endpoint للتعامل مع redirect
      // callBackUrl يجب أن يكون URL يمكن الوصول إليه من Paylink (من الخارج)
      // مع nginx: يجب أن يكون http://localhost/api/payments/webhook
      // بدون nginx: يجب أن يكون http://localhost:3000/v1/payments/webhook
      const callbackBaseUrl = this.configService.get<string>('CALLBACK_BASE_URL') ||
        this.configService.get<string>('NEXT_PUBLIC_API_URL') ||
        this.configService.get<string>('VITE_API_URL') ||
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost';

      // بناء callBackUrl
      // إذا كان callbackBaseUrl يحتوي على '/api' (مثل http://localhost/api)،
      // يجب استخدام '/payments/webhook' فقط لأن nginx سيعيد كتابة /api/ إلى /v1/
      // إذا كان callbackBaseUrl لا يحتوي على '/api' (مثل http://localhost:3000)،
      // يجب استخدام '/v1/payments/webhook' مباشرة
      const hasApiPrefix = callbackBaseUrl.includes('/api');
      const callBackUrl = hasApiPrefix
        ? `${callbackBaseUrl}/payments/webhook?orderNumber=${appointmentId}`
        : `${callbackBaseUrl}/v1/payments/webhook?orderNumber=${appointmentId}`;

      // بناء successUrl و cancelUrl كـ fallback (إذا كان Paylink يدعمها)
      let frontendUrl = this.configService.get<string>('NEXT_PUBLIC_FRONTEND_URL') ||
        this.configService.get<string>('FRONTEND_URL') ||
        this.configService.get<string>('NEXT_PUBLIC_SITE_URL') ||
        'http://localhost';

      // تنظيف الـ URL من أي حرف 'h' إضافي في البداية
      if (frontendUrl.startsWith('hhttp://') || frontendUrl.startsWith('hhttps://')) {
        frontendUrl = frontendUrl.substring(1);
      }

      const successUrl = `${frontendUrl}/appointments/confirmation?id=${appointmentId}`;
      const cancelUrl = `${frontendUrl}/appointments/${appointmentId}/payment?canceled=true`;

      // #region agent log
      this.logger.log(`Payment URLs - callBackUrl: ${callBackUrl}, successUrl: ${successUrl}, cancelUrl: ${cancelUrl}`);
      // #endregion

      // 4. إنشاء الفاتورة في Paylink
      this.logger.log(`Creating Paylink invoice for appointment ${appointmentId}, amount: ${amount}`);

      const invoice = await this.paylinkService.createInvoice({
        amount,
        clientName,
        clientMobile,
        orderNumber,
        description: `Booking for ${appointment.type} appointment`,
        callBackUrl,
        successUrl,
        cancelUrl,
      });

      const transactionNo = invoice.transactionNo;

      // 5. حفظ/تحديث سجل الدفع
      let payment: PaymentDocument;
      if (existingPayment) {
        // كان هناك دفع سابق (غالباً FAILED/REFUNDED) -> نعيد تهيئته لمحاولة جديدة
        existingPayment.status = PaymentStatus.PENDING;
        existingPayment.paymentMethod = PaymentMethod.CREDIT_CARD;
        existingPayment.intentId = transactionNo;
        existingPayment.transactionId = undefined;
        existingPayment.paidAt = undefined;
        existingPayment.failureReason = undefined;
        existingPayment.metadata = {
          ...(existingPayment.metadata || {}),
          provider: 'paylink',
          orderNumber,
          paylinkInvoiceUrl: invoice.url,
          patientName: clientName,
          patientMobile: clientMobile,
        };
        payment = await existingPayment.save();
      } else {
        payment = new this.paymentModel({
          appointmentId: new Types.ObjectId(appointmentId),
          amount,
          currency: 'SAR',
          status: PaymentStatus.PENDING,
          paymentMethod: PaymentMethod.CREDIT_CARD, // Default logic
          intentId: transactionNo, // Store transactionNo as intentId for consistency
          metadata: {
            provider: 'paylink',
            orderNumber,
            paylinkInvoiceUrl: invoice.url,
            patientName: clientName,
            patientMobile: clientMobile,
          }
        }) as PaymentDocument;
        await payment.save();
      }

      this.logger.log(`Payment intent created successfully - TransactionNo: ${transactionNo}`);

      return {
        intentId: transactionNo,
        clientSecret: '', // Not used in Paylink flow
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
      };

    } catch (error) {
      this.logger.error(`Paylink Invoice Creation Failed: ${error.message}`, error.stack);

      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      // إرجاع رسالة خطأ واضحة مع تفاصيل إضافية للتشخيص
      const errorMessage = error?.message || 'Unknown error occurred';
      this.logger.error(`Payment intent creation failed for appointment ${appointmentId}: ${errorMessage}`, error?.stack);
      
      throw new BadRequestException(`Failed to create payment invoice: ${errorMessage}`);
    }
  }

  /**
   * معالجة webhook من Paylink
   */
  async handleWebhook(webhookDto: PaymentWebhookDto): Promise<PaymentResponseDto> {
    const { event, data } = webhookDto;

    this.logger.log(`Received webhook event: ${event}`, JSON.stringify(data));

    // Paylink يرسل transactionNo في webhook
    // البحث عن الدفع بناءً على transactionNo (المخزن في intentId) أو transactionId
    let payment: PaymentDocument | null = null;

    const transactionNo = data.transactionNo || data.intentId || data.transactionId;

    if (transactionNo) {
      // البحث باستخدام intentId (الذي يحتوي على transactionNo)
      payment = await this.paymentModel.findOne({ intentId: transactionNo });

      // إذا لم يُوجد، البحث باستخدام transactionId
      if (!payment) {
        payment = await this.paymentModel.findOne({ transactionId: transactionNo });
      }
    }

    if (!payment) {
      this.logger.warn(`Payment not found for transaction: ${transactionNo}`);
      throw new NotFoundException('Payment not found');
    }

    // تحديث حالة الدفع بناءً على الحدث
    switch (event) {
      case 'payment.completed':
      case 'Paid':
      case 'paid':
        payment.status = PaymentStatus.COMPLETED;
        payment.paidAt = new Date();
        payment.transactionId = data.transactionId || transactionNo;

        // التحقق إذا كان هذا payment لـ reservation (لم يتم إنشاء appointment بعد)
        const reservationId = payment.metadata?.reservationId;

        if (reservationId && !payment.appointmentId) {
          // إنشاء الحجز الفعلي من reservation
          try {
            const appointment = await this.appointmentService.createAppointmentFromReservation(
              reservationId,
              (payment._id as Types.ObjectId).toString(),
            );

            // تحديث payment بـ appointmentId
            payment.appointmentId = new Types.ObjectId(appointment.id);
            await payment.save();

            this.logger.log(`Appointment created from reservation ${reservationId} with ID: ${appointment.id}`);
          } catch (error) {
            this.logger.error(`Failed to create appointment from reservation: ${error.message}`);
            throw error; // نرمي الخطأ لأن الدفع تم ولكن فشل إنشاء الحجز
          }
        } else if (payment.appointmentId) {
          // تحديث حالة الدفع في الموعد الموجود
          try {
            await this.appointmentService.markAsPaid(
              payment.appointmentId.toString(),
              (payment._id as Types.ObjectId).toString(),
            );
            this.logger.log(`Appointment ${payment.appointmentId} marked as paid`);
          } catch (error) {
            this.logger.error(`Failed to update appointment payment status: ${error.message}`);
          }
        }
        break;

      case 'payment.failed':
      case 'Failed':
      case 'failed':
        payment.status = PaymentStatus.FAILED;
        payment.failureReason = data.failureReason || data.message || 'Payment failed';
        break;

      case 'payment.refunded':
      case 'Refunded':
      case 'refunded':
        payment.status = PaymentStatus.REFUNDED;
        break;

      case 'payment.canceled':
      case 'Canceled':
      case 'canceled':
        // يمكن التعامل مع الإلغاء كفشل أو حالة منفصلة
        payment.status = PaymentStatus.FAILED;
        payment.failureReason = 'Payment was canceled';
        break;

      default:
        this.logger.warn(`Unsupported webhook event: ${event}`);
        throw new BadRequestException(`Unsupported webhook event: ${event}`);
    }

    await payment.save();
    this.logger.log(`Payment ${payment._id} updated to status: ${payment.status}`);

    return this.mapToResponse(payment);
  }

  /**
   * التحقق من حالة الدفع
   */
  async verifyPayment(appointmentId: string): Promise<PaymentResponseDto | null> {
    const payment = await this.paymentModel.findOne({
      appointmentId: new Types.ObjectId(appointmentId)
    });

    if (!payment) {
      return null;
    }

    return this.mapToResponse(payment);
  }

  /**
   * جلب معلومات الدفع باستخدام transactionNo
   */
  async getPaymentByTransactionNo(transactionNo: string): Promise<PaymentResponseDto | null> {
    const payment = await this.paymentModel.findOne({
      $or: [
        { intentId: transactionNo },
        { transactionId: transactionNo },
      ],
    });

    if (!payment) return null;

    return this.mapToResponse(payment);
  }

  /**
   * جلب معلومات الدفع للموعد أو الحجز المؤقت (reservation)
   * يدعم appointmentId (ObjectId) أو reservationId (string)
   */
  async getPaymentByAppointment(appointmentId: string): Promise<PaymentResponseDto | null> {
    let payment: PaymentDocument | null = null;

    // التحقق إذا كان ID من نوع ObjectId صالح
    const isValidObjectId = Types.ObjectId.isValid(appointmentId) &&
      appointmentId.length === 24;

    if (isValidObjectId) {
      // البحث عن payment بـ appointmentId
      payment = await this.paymentModel.findOne({
        appointmentId: new Types.ObjectId(appointmentId),
      });
    }

    // إذا لم نجد payment بـ appointmentId، نبحث عن reservationId في metadata
    if (!payment) {
      payment = await this.paymentModel.findOne({
        'metadata.reservationId': appointmentId,
      });
    }

    if (!payment) return null;

    // If payment is pending, attempt to verify with Paylink (useful in local/dev
    // when webhook cannot reach localhost).
    if (payment.status === PaymentStatus.PENDING && payment.intentId) {
      const verified = await this.paylinkService.verifyPayment(payment.intentId);

      if (verified) {
        if (verified.paid) {
          payment.status = PaymentStatus.COMPLETED;
          payment.paidAt = new Date();

          // التحقق إذا كان هذا payment لـ reservation (لم يتم إنشاء appointment بعد)
          const reservationId = payment.metadata?.reservationId;

          if (reservationId && !payment.appointmentId) {
            // إنشاء الحجز الفعلي من reservation
            try {
              const appointment = await this.appointmentService.createAppointmentFromReservation(
                reservationId,
                (payment._id as Types.ObjectId).toString(),
              );

              // تحديث payment بـ appointmentId
              payment.appointmentId = new Types.ObjectId(appointment.id);
              await payment.save();

              this.logger.log(`Appointment created from reservation ${reservationId} with ID: ${appointment.id}`);
            } catch (error) {
              this.logger.error(`Failed to create appointment from reservation: ${error.message}`);
            }
          } else if (payment.appointmentId) {
            try {
              await this.appointmentService.markAsPaid(
                payment.appointmentId.toString(),
                (payment._id as Types.ObjectId).toString(),
              );
            } catch (error) {
              this.logger.error(`Failed to update appointment payment status: ${error.message}`);
            }
          }
          await payment.save();
        } else {
          const s = (verified.status || '').toLowerCase();
          if (
            s.includes('cancel') ||
            s.includes('canceled') ||
            s.includes('cancelled') ||
            s.includes('fail') ||
            s.includes('declin') ||
            s.includes('unpaid') ||
            s.includes('reject')
          ) {
            payment.status = PaymentStatus.FAILED;
            payment.failureReason = `Paylink status: ${verified.status}`;
            await payment.save();
          }
        }
      }
    }

    return this.mapToResponse(payment);
  }

  /**
   * تحديث حالة الدفع إلى مكتمل
   */
  async markAsPaid(appointmentId: string, transactionId?: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentModel.findOne({
      appointmentId: new Types.ObjectId(appointmentId)
    });

    if (!payment) {
      throw new NotFoundException('Payment not found for this appointment');
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment is already completed');
    }

    payment.status = PaymentStatus.COMPLETED;
    payment.paidAt = new Date();
    if (transactionId) {
      payment.transactionId = transactionId;
    }

    await payment.save();

    // تحديث حالة الدفع في الموعد
    try {
      await this.appointmentService.markAsPaid(appointmentId, (payment._id as Types.ObjectId).toString());
    } catch (error) {
      // Log error but don't fail the payment update
      console.error('Failed to update appointment payment status:', error);
    }

    return this.mapToResponse(payment);
  }

  /**
   * جلب سجل مدفوعات المريض
   */
  async getPatientPayments(patientId: string): Promise<PaymentResponseDto[]> {
    // 1. جلب جميع مواعيد المريض
    const appointments = await this.appointmentModel
      .find({ patientId: new Types.ObjectId(patientId) })
      .select('_id')
      .lean();

    const appointmentIds = appointments.map(app => app._id);

    if (appointmentIds.length === 0) {
      return [];
    }

    // 2. جلب المدفوعات المرتبطة بهذه المواعيد
    const payments = await this.paymentModel
      .find({ appointmentId: { $in: appointmentIds } })
      .sort({ createdAt: -1 }) // الأحدث أولاً
      .lean();

    // 3. تحويل النتيجة
    return payments.map(p => this.mapToResponse(p as unknown as PaymentDocument));
  }

  /**
   * تحويل Payment Document إلى Response DTO
   */
  private mapToResponse(payment: PaymentDocument | any): PaymentResponseDto {
    return {
      id: (payment as any)._id.toString(),
      // Handle case where appointmentId is undefined (for reservation-based payments)
      appointmentId: payment.appointmentId ? payment.appointmentId.toString() : (payment.metadata?.reservationId || ''),
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      intentId: payment.intentId,
      transactionId: payment.transactionId,
      paidAt: payment.paidAt,
      failureReason: payment.failureReason,
      createdAt: (payment as any).createdAt,
      updatedAt: (payment as any).updatedAt,
      metadata: payment.metadata,
    };
  }
}
