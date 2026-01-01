import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface CreateInvoiceDto {
  amount: number;
  clientName: string;
  clientMobile: string;
  orderNumber: string;
  description: string;
  callBackUrl: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface InvoiceResponse {
  transactionNo: string;
  url: string;
}

export interface PaylinkInvoiceResponse {
  transactionNo: string;
  url: string;
  invoiceId?: string;
  status?: string;
  // Paylink may use other fields; we normalize into `status`
  [key: string]: any;
}

@Injectable()
export class PaylinkService {
  private readonly logger = new Logger(PaylinkService.name);
  private readonly apiUrl: string;
  private readonly apiId: string;
  private readonly secretKey: string;
  private readonly mode: string;
  private readonly axiosInstance: AxiosInstance;
  private idToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('PAYLINK_API_URL') || 'https://restpilot.paylink.sa';
    this.apiId = this.configService.get<string>('PAYLINK_API_ID') || 'APP_ID_1123453311';
    this.secretKey = this.configService.get<string>('PAYLINK_SECRET_KEY') || '0662abb5-13c7-38ab-cd12-236e58f43766';
    this.mode = this.configService.get<string>('PAYLINK_MODE') || 'test';

    // Create axios instance with default config
    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
    });

    this.logger.log(`PaylinkService initialized - Mode: ${this.mode}, API URL: ${this.apiUrl}, API ID: ${this.apiId}`);
  }

  /**
   * الحصول على Authentication Token من Paylink
   */
  private async authenticate(): Promise<string> {
    // إذا كان Token موجود وصالح، استخدمه
    if (this.idToken && Date.now() < this.tokenExpiry) {
      return this.idToken;
    }

    try {
      this.logger.log('Authenticating with Paylink API...');
      
      const response = await this.axiosInstance.post<{ id_token: string }>(
        '/api/auth',
        {
          apiId: this.apiId,
          secretKey: this.secretKey,
          persistToken: false,
        },
      );

      if (!response.data || !response.data.id_token) {
        throw new BadRequestException('Failed to get authentication token from Paylink');
      }

      this.idToken = response.data.id_token;
      // Token صالح لمدة ساعة (3600 ثانية)
      this.tokenExpiry = Date.now() + (3600 * 1000) - 60000; // نطرح دقيقة للاحتياط

      this.logger.log('Successfully authenticated with Paylink API');
      return this.idToken;
    } catch (error) {
      this.logger.error(`Paylink authentication failed: ${error.message}`, error.stack);
      
      if (error.response) {
        this.logger.error(`Paylink auth error response: ${JSON.stringify(error.response.data)}`);
        throw new BadRequestException(
          `Paylink authentication error: ${error.response.data?.message || error.response.statusText}`,
        );
      }
      
      throw new BadRequestException(`Failed to authenticate with Paylink: ${error.message}`);
    }
  }

  /**
   * إنشاء فاتورة Paylink
   */
  async createInvoice(dto: CreateInvoiceDto): Promise<InvoiceResponse> {
    try {
      this.logger.log(`Creating Paylink invoice for order: ${dto.orderNumber}, amount: ${dto.amount}`);

      // الحصول على Authentication Token
      const token = await this.authenticate();

      const payload: any = {
        amount: dto.amount,
        clientName: dto.clientName,
        clientMobile: dto.clientMobile,
        orderNumber: dto.orderNumber,
        description: dto.description,
        callBackUrl: dto.callBackUrl,
      };

      // إضافة successUrl و cancelUrl إذا كانت متوفرة
      if (dto.successUrl) {
        payload.successUrl = dto.successUrl;
      }
      if (dto.cancelUrl) {
        payload.cancelUrl = dto.cancelUrl;
      }

      // Test mode specific fields
      if (this.mode === 'test') {
        // Test mode doesn't require additional fields
      }

      const response = await this.axiosInstance.post<PaylinkInvoiceResponse>(
        '/api/addInvoice',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        },
      );

      if (!response.data || !response.data.transactionNo) {
        throw new BadRequestException('Invalid response from Paylink API');
      }

      this.logger.log(`Paylink invoice created successfully - TransactionNo: ${response.data.transactionNo}`);

      return {
        transactionNo: response.data.transactionNo,
        url: response.data.url || `https://paylink.sa/pay/${response.data.transactionNo}`,
      };
    } catch (error) {
      this.logger.error(`Failed to create Paylink invoice: ${error.message}`, error.stack);
      
      if (error.response) {
        this.logger.error(`Paylink API error response: ${JSON.stringify(error.response.data)}`);
        throw new BadRequestException(
          `Paylink API error: ${error.response.data?.message || error.response.statusText}`,
        );
      }
      
      throw new BadRequestException(`Failed to create payment invoice: ${error.message}`);
    }
  }

  /**
   * جلب تفاصيل الفاتورة
   */
  async getInvoice(transactionNo: string): Promise<PaylinkInvoiceResponse | null> {
    try {
      this.logger.log(`Fetching Paylink invoice: ${transactionNo}`);

      // الحصول على Authentication Token
      const token = await this.authenticate();

      const response = await this.axiosInstance.get<PaylinkInvoiceResponse>(
        `/api/getInvoice/${transactionNo}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        },
      );

      const data: any = response.data;
      const orderStatus: any =
        data?.orderStatus ??
        data?.order_status ??
        data?.OrderStatus ??
        data?.data?.orderStatus ??
        data?.data?.order_status ??
        data?.data?.OrderStatus;
      const successFlag: any = data?.success ?? data?.data?.success;
      const paymentErrors: any = data?.paymentErrors ?? data?.payment_errors ?? data?.data?.paymentErrors;
      const paymentErrorsCount = Array.isArray(paymentErrors) ? paymentErrors.length : (paymentErrors ? 1 : 0);

      // Normalize status field across possible API shapes
      const normalizedStatus: string | undefined =
        (data && typeof data === 'object'
          ? (data.status ??
              data.invoiceStatus ??
              data.paymentStatus ??
              data.invoice_status ??
              data.payment_status ??
              data.Status ??
              data.InvoiceStatus ??
              data.PaymentStatus ??
              data.orderStatus ??
              data.order_status ??
              data.OrderStatus ??
              (data.data && (data.data.status ?? data.data.invoiceStatus ?? data.data.paymentStatus)))
          : undefined) as any;

      if (data && typeof data === 'object' && !data.status && normalizedStatus) {
        data.status = normalizedStatus;
      }

      return (data as PaylinkInvoiceResponse) || null;
    } catch (error) {
      this.logger.error(`Failed to get Paylink invoice: ${error.message}`, error.stack);
      
      if (error.response?.status === 404) {
        return null;
      }
      
      throw new BadRequestException(`Failed to get invoice: ${error.message}`);
    }
  }

  /**
   * التحقق من حالة الدفع
   */
  async verifyPayment(transactionNo: string): Promise<{ status: string; paid: boolean } | null> {
    try {
      const invoice = await this.getInvoice(transactionNo);
      
      if (!invoice) {
        return null;
      }

      // Paylink status values: 'Paid', 'Unpaid', 'Canceled', etc.
      const status =
        (invoice as any).status ??
        (invoice as any).orderStatus ??
        (invoice as any).order_status ??
        (invoice as any).OrderStatus;
      const statusStr = typeof status === 'string' ? status : String(status ?? 'Unknown');
      const paymentErrors: any =
        (invoice as any).paymentErrors ??
        (invoice as any).payment_errors ??
        (invoice as any).data?.paymentErrors;
      const paymentErrorsCount = Array.isArray(paymentErrors) ? paymentErrors.length : (paymentErrors ? 1 : 0);
      const paid =
        statusStr === 'Paid' ||
        statusStr === 'paid' ||
        statusStr.toLowerCase() === 'paid';
      return {
        status: statusStr || 'Unknown',
        paid,
      };
    } catch (error) {
      this.logger.error(`Failed to verify payment: ${error.message}`, error.stack);
      return null;
    }
  }
}

