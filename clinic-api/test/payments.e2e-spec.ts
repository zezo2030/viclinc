import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Payments (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        MongooseModule.forRootAsync({
          useFactory: () => ({
            uri: process.env.MONGO_URI || 'mongodb://localhost:27017/clinic_test',
          }),
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/v1/payments/intent (POST)', () => {
    it('should create payment intent successfully', () => {
      const createPaymentIntentDto = {
        appointmentId: '64f1a2b3c4d5e6f7g8h9i0j1',
      };

      return request(app.getHttpServer())
        .post('/v1/payments/intent')
        .send(createPaymentIntentDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('intentId');
          expect(res.body).toHaveProperty('clientSecret');
          expect(res.body).toHaveProperty('amount');
          expect(res.body).toHaveProperty('currency');
          expect(res.body).toHaveProperty('status');
          expect(res.body.intentId).toMatch(/^pi_/);
          expect(res.body.clientSecret).toMatch(/^pi_.*_secret_/);
          expect(res.body.amount).toBe(150.00);
          expect(res.body.currency).toBe('SAR');
          expect(res.body.status).toBe('PENDING');
        });
    });

    it('should return 400 for invalid appointment ID', () => {
      const createPaymentIntentDto = {
        appointmentId: 'invalid-id',
      };

      return request(app.getHttpServer())
        .post('/v1/payments/intent')
        .send(createPaymentIntentDto)
        .expect(400);
    });

    it('should return 400 for missing appointment ID', () => {
      return request(app.getHttpServer())
        .post('/v1/payments/intent')
        .send({})
        .expect(400);
    });
  });

  describe('/v1/payments/webhook (POST)', () => {
    it('should handle payment completed webhook', async () => {
      // أولاً، إنشاء payment intent
      const createPaymentIntentDto = {
        appointmentId: '64f1a2b3c4d5e6f7g8h9i0j2',
      };

      const intentResponse = await request(app.getHttpServer())
        .post('/v1/payments/intent')
        .send(createPaymentIntentDto)
        .expect(201);

      const intentId = intentResponse.body.intentId;

      // إرسال webhook للدفع المكتمل
      const webhookDto = {
        event: 'payment.completed',
        data: {
          intentId: intentId,
          transactionId: 'txn_123456789',
        },
      };

      return request(app.getHttpServer())
        .post('/v1/payments/webhook')
        .send(webhookDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('appointmentId');
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('transactionId');
          expect(res.body).toHaveProperty('paidAt');
          expect(res.body.status).toBe('COMPLETED');
          expect(res.body.transactionId).toBe('txn_123456789');
        });
    });

    it('should handle payment failed webhook', async () => {
      // إنشاء payment intent
      const createPaymentIntentDto = {
        appointmentId: '64f1a2b3c4d5e6f7g8h9i0j3',
      };

      const intentResponse = await request(app.getHttpServer())
        .post('/v1/payments/intent')
        .send(createPaymentIntentDto)
        .expect(201);

      const intentId = intentResponse.body.intentId;

      // إرسال webhook للدفع الفاشل
      const webhookDto = {
        event: 'payment.failed',
        data: {
          intentId: intentId,
          failureReason: 'Insufficient funds',
        },
      };

      return request(app.getHttpServer())
        .post('/v1/payments/webhook')
        .send(webhookDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('failureReason');
          expect(res.body.status).toBe('FAILED');
          expect(res.body.failureReason).toBe('Insufficient funds');
        });
    });

    it('should return 400 for unsupported webhook event', () => {
      const webhookDto = {
        event: 'payment.invalid',
        data: {
          intentId: 'pi_123456789',
        },
      };

      return request(app.getHttpServer())
        .post('/v1/payments/webhook')
        .send(webhookDto)
        .expect(400);
    });

    it('should return 404 for non-existent payment', () => {
      const webhookDto = {
        event: 'payment.completed',
        data: {
          intentId: 'pi_nonexistent',
        },
      };

      return request(app.getHttpServer())
        .post('/v1/payments/webhook')
        .send(webhookDto)
        .expect(404);
    });
  });

  describe('/v1/payments/:appointmentId (GET)', () => {
    it('should get payment by appointment ID', async () => {
      // إنشاء payment intent أولاً
      const createPaymentIntentDto = {
        appointmentId: '64f1a2b3c4d5e6f7g8h9i0j4',
      };

      await request(app.getHttpServer())
        .post('/v1/payments/intent')
        .send(createPaymentIntentDto)
        .expect(201);

      // جلب معلومات الدفع
      return request(app.getHttpServer())
        .get('/v1/payments/64f1a2b3c4d5e6f7g8h9i0j4')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('appointmentId');
          expect(res.body).toHaveProperty('amount');
          expect(res.body).toHaveProperty('currency');
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('paymentMethod');
          expect(res.body.appointmentId).toBe('64f1a2b3c4d5e6f7g8h9i0j4');
          expect(res.body.status).toBe('PENDING');
        });
    });

    it('should return null for non-existent payment', () => {
      return request(app.getHttpServer())
        .get('/v1/payments/64f1a2b3c4d5e6f7g8h9i0j5')
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeNull();
        });
    });
  });

  describe('Payment Integration with Appointments', () => {
    it('should require payment for VIDEO appointments', () => {
      // هذا الاختبار يتطلب إنشاء موعد فعلي
      // TODO: تنفيذ اختبار كامل مع إنشاء موعد VIDEO
    });

    it('should require payment for CHAT appointments', () => {
      // هذا الاختبار يتطلب إنشاء موعد فعلي
      // TODO: تنفيذ اختبار كامل مع إنشاء موعد CHAT
    });

    it('should not require payment for IN_PERSON appointments', () => {
      // هذا الاختبار يتطلب إنشاء موعد فعلي
      // TODO: تنفيذ اختبار كامل مع إنشاء موعد IN_PERSON
    });
  });
});
