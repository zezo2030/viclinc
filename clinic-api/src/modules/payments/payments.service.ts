import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument, PaymentStatus, PaymentMethod } from './schemas/payment.schema';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { PaymentResponseDto, PaymentIntentResponseDto } from './dto/payment-response.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  /**
   * إنشاء نية دفع وهمية (stub)
   */
  async createPaymentIntent(createDto: CreatePaymentIntentDto): Promise<PaymentIntentResponseDto> {
    const { appointmentId } = createDto;

    // التحقق من وجود الموعد
    // TODO: إضافة التحقق من وجود الموعد في AppointmentService
    
    // إنشاء نية دفع وهمية
    const intentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const clientSecret = `${intentId}_secret_${Math.random().toString(36).substr(2, 9)}`;

    // إنشاء سجل دفع
    const payment = new this.paymentModel({
      appointmentId: new Types.ObjectId(appointmentId),
      amount: 150.00, // TODO: جلب السعر من الموعد
      currency: 'SAR',
      status: PaymentStatus.PENDING,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      intentId,
      metadata: {
        provider: 'stub',
        version: '1.0',
        createdBy: 'system'
      }
    });

    await payment.save();

    return {
      intentId,
      clientSecret,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status
    };
  }

  /**
   * معالجة webhook placeholder
   */
  async handleWebhook(webhookDto: PaymentWebhookDto): Promise<PaymentResponseDto> {
    const { event, data } = webhookDto;

    // البحث عن الدفع بناءً على intentId أو transactionId
    let payment: PaymentDocument | null = null;
    
    if (data.intentId) {
      payment = await this.paymentModel.findOne({ intentId: data.intentId });
    } else if (data.transactionId) {
      payment = await this.paymentModel.findOne({ transactionId: data.transactionId });
    } else {
      throw new BadRequestException('No payment identifier found in webhook data');
    }

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // تحديث حالة الدفع بناءً على الحدث
    switch (event) {
      case 'payment.completed':
        payment.status = PaymentStatus.COMPLETED;
        payment.paidAt = new Date();
        payment.transactionId = data.transactionId || `txn_${Date.now()}`;
        break;
      
      case 'payment.failed':
        payment.status = PaymentStatus.FAILED;
        payment.failureReason = data.failureReason || 'Payment failed';
        break;
      
      case 'payment.refunded':
        payment.status = PaymentStatus.REFUNDED;
        break;
      
      default:
        throw new BadRequestException(`Unsupported webhook event: ${event}`);
    }

    await payment.save();

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
   * جلب معلومات الدفع للموعد
   */
  async getPaymentByAppointment(appointmentId: string): Promise<PaymentResponseDto | null> {
    return this.verifyPayment(appointmentId);
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

    return this.mapToResponse(payment);
  }

  /**
   * تحويل Payment Document إلى Response DTO
   */
  private mapToResponse(payment: PaymentDocument): PaymentResponseDto {
    return {
      id: (payment as any)._id.toString(),
      appointmentId: payment.appointmentId.toString(),
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
    };
  }
}
