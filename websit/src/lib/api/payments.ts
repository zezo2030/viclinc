import { apiClient } from './client';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CASH';

export interface PaymentIntent {
  intentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
}

export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  intentId?: string;
  transactionId?: string;
  paidAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    paylinkInvoiceUrl?: string;
    [key: string]: any;
  };
}

export interface CreatePaymentIntentDto {
  appointmentId: string;
}

export const paymentsService = {
  // إنشاء نية دفع
  createPaymentIntent: async (appointmentId: string): Promise<PaymentIntent> => {
    return apiClient.post('/payments/intent', { appointmentId });
  },

  // جلب حالة الدفع للموعد
  getPaymentByAppointment: async (appointmentId: string): Promise<Payment | null> => {
    try {
      return await apiClient.get(`/payments/${appointmentId}`);
    } catch (error: any) {
      // إذا كان 404، يعني لا يوجد دفع بعد
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        return null;
      }
      throw error;
    }
  },

  // التحقق من حالة الدفع
  verifyPayment: async (appointmentId: string): Promise<Payment | null> => {
    return paymentsService.getPaymentByAppointment(appointmentId);
  },
};




