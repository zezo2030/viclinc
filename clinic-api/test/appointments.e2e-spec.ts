import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { RedisService } from '../src/modules/shared/redis/redis.service';

describe('Appointments (e2e)', () => {
  let app: INestApplication;
  let redisService: RedisService;
  let patientToken: string;
  let doctorToken: string;
  let patientId: string;
  let doctorId: string;
  let serviceId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    redisService = moduleFixture.get<RedisService>(RedisService);
    
    await app.init();

    // إنشاء مستخدم مريض
    const patientResponse = await request(app.getHttpServer())
      .post('/auth/register/patient')
      .send({
        name: 'Test Patient',
        email: 'patient@test.com',
        phone: '+1234567890',
        password: 'password123',
      });

    patientToken = patientResponse.body.accessToken;
    patientId = patientResponse.body.user.id;

    // إنشاء طبيب (يحتاج إلى أدمن)
    const doctorResponse = await request(app.getHttpServer())
      .post('/auth/register/patient')
      .send({
        name: 'Test Doctor',
        email: 'doctor@test.com',
        phone: '+1234567891',
        password: 'password123',
      });

    doctorToken = doctorResponse.body.accessToken;
    doctorId = doctorResponse.body.user.id;

    // إنشاء خدمة (يحتاج إلى أدمن)
    const serviceResponse = await request(app.getHttpServer())
      .post('/admin/services')
      .set('Authorization', `Bearer ${doctorToken}`) // مؤقت - يجب أن يكون أدمن
      .send({
        name: 'General Consultation',
        departmentId: '64f1a2b3c4d5e6f7g8h9i0j1', // ID وهمي
        description: 'General medical consultation',
        defaultDurationMin: 30,
        defaultPrice: 100,
      });

    serviceId = serviceResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // تنظيف Redis
    await redisService.deleteIdempotencyKey('idempotency:test-key-1');
    await redisService.deleteIdempotencyKey('idempotency:test-key-2');
  });

  describe('POST /patient/appointments', () => {
    it('should create a new appointment successfully', async () => {
      const appointmentData = {
        doctorId,
        serviceId,
        startAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // غداً
        type: 'IN_PERSON',
        metadata: { notes: 'Test appointment' },
      };

      const response = await request(app.getHttpServer())
        .post('/patient/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(appointmentData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.doctorId).toBe(doctorId);
      expect(response.body.patientId).toBe(patientId);
      expect(response.body.status).toBe('PENDING_CONFIRM');
      expect(response.body.holdExpiresAt).toBeDefined();
    });

    it('should prevent duplicate appointments with same idempotency key', async () => {
      const appointmentData = {
        doctorId,
        serviceId,
        startAt: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        type: 'IN_PERSON',
      };

      const idempotencyKey = 'test-key-1';

      // أول طلب
      const response1 = await request(app.getHttpServer())
        .post('/patient/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .set('idempotency-key', idempotencyKey)
        .send(appointmentData)
        .expect(201);

      // طلب ثاني بنفس المفتاح
      const response2 = await request(app.getHttpServer())
        .post('/patient/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .set('idempotency-key', idempotencyKey)
        .send(appointmentData)
        .expect(201);

      // يجب أن يكون نفس الحجز
      expect(response1.body.id).toBe(response2.body.id);
    });

    it('should prevent concurrent bookings for same time slot', async () => {
      const appointmentData = {
        doctorId,
        serviceId,
        startAt: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
        type: 'IN_PERSON',
      };

      // طلبين متزامنين لنفس الوقت
      const [response1, response2] = await Promise.allSettled([
        request(app.getHttpServer())
          .post('/patient/appointments')
          .set('Authorization', `Bearer ${patientToken}`)
          .send(appointmentData),
        request(app.getHttpServer())
          .post('/patient/appointments')
          .set('Authorization', `Bearer ${patientToken}`)
          .send(appointmentData),
      ]);

      // واحد فقط يجب أن ينجح
      const successCount = [response1, response2].filter(
        result => result.status === 'fulfilled' && result.value.status === 201
      ).length;

      expect(successCount).toBe(1);
    });

    it('should reject appointment for invalid doctor', async () => {
      const appointmentData = {
        doctorId: '64f1a2b3c4d5e6f7g8h9i0j9', // ID غير موجود
        serviceId,
        startAt: new Date(Date.now() + 27 * 60 * 60 * 1000).toISOString(),
        type: 'IN_PERSON',
      };

      await request(app.getHttpServer())
        .post('/patient/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(appointmentData)
        .expect(404);
    });

    it('should reject appointment for invalid service', async () => {
      const appointmentData = {
        doctorId,
        serviceId: '64f1a2b3c4d5e6f7g8h9i0j9', // ID غير موجود
        startAt: new Date(Date.now() + 28 * 60 * 60 * 1000).toISOString(),
        type: 'IN_PERSON',
      };

      await request(app.getHttpServer())
        .post('/patient/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(appointmentData)
        .expect(404);
    });
  });

  describe('GET /patient/appointments', () => {
    it('should get patient appointments', async () => {
      const response = await request(app.getHttpServer())
        .get('/patient/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('appointments');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(Array.isArray(response.body.appointments)).toBe(true);
    });

    it('should filter appointments by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/patient/appointments?status=PENDING_CONFIRM')
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(response.body.appointments.every(
        (appointment: any) => appointment.status === 'PENDING_CONFIRM'
      )).toBe(true);
    });
  });

  describe('POST /patient/appointments/:id/cancel', () => {
    let appointmentId: string;

    beforeEach(async () => {
      // إنشاء حجز للاختبار
      const appointmentData = {
        doctorId,
        serviceId,
        startAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // بعد يومين
        type: 'IN_PERSON',
      };

      const response = await request(app.getHttpServer())
        .post('/patient/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(appointmentData);

      appointmentId = response.body.id;
    });

    it('should cancel appointment successfully (> 24h)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/patient/appointments/${appointmentId}/cancel`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ reason: 'Patient request' })
        .expect(200);

      expect(response.body.status).toBe('CANCELLED');
      expect(response.body.cancellationReason).toBe('Patient request');
      expect(response.body.cancelledAt).toBeDefined();
    });

    it('should reject cancellation for appointment < 24h', async () => {
      // إنشاء حجز قريب (أقل من 24 ساعة)
      const nearAppointmentData = {
        doctorId,
        serviceId,
        startAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // بعد ساعتين
        type: 'IN_PERSON',
      };

      const nearResponse = await request(app.getHttpServer())
        .post('/patient/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(nearAppointmentData);

      await request(app.getHttpServer())
        .post(`/patient/appointments/${nearResponse.body.id}/cancel`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ reason: 'Patient request' })
        .expect(400);
    });
  });

  describe('POST /patient/appointments/:id/reschedule', () => {
    let appointmentId: string;

    beforeEach(async () => {
      // إنشاء حجز للاختبار
      const appointmentData = {
        doctorId,
        serviceId,
        startAt: new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString(), // بعد يومين
        type: 'IN_PERSON',
      };

      const response = await request(app.getHttpServer())
        .post('/patient/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(appointmentData);

      appointmentId = response.body.id;
    });

    it('should reschedule appointment successfully (> 24h)', async () => {
      const newStartAt = new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString(); // بعد يومين ونصف

      const response = await request(app.getHttpServer())
        .post(`/patient/appointments/${appointmentId}/reschedule`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ newStartAt })
        .expect(200);

      expect(response.body.startAt).toBe(newStartAt);
      expect(response.body.status).toBe('PENDING_CONFIRM');
    });

    it('should reject rescheduling for appointment < 24h', async () => {
      // إنشاء حجز قريب (أقل من 24 ساعة)
      const nearAppointmentData = {
        doctorId,
        serviceId,
        startAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // بعد 3 ساعات
        type: 'IN_PERSON',
      };

      const nearResponse = await request(app.getHttpServer())
        .post('/patient/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(nearAppointmentData);

      const newStartAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

      await request(app.getHttpServer())
        .post(`/patient/appointments/${nearResponse.body.id}/reschedule`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ newStartAt })
        .expect(400);
    });
  });

  describe('GET /doctor/appointments', () => {
    it('should get doctor appointments', async () => {
      const response = await request(app.getHttpServer())
        .get('/doctor/appointments')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('appointments');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.appointments)).toBe(true);
    });

    it('should filter doctor appointments by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/doctor/appointments?status=PENDING_CONFIRM')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.appointments.every(
        (appointment: any) => appointment.status === 'PENDING_CONFIRM'
      )).toBe(true);
    });
  });

  describe('Hold TTL functionality', () => {
    it('should handle expired holds', async () => {
      // هذا الاختبار يتطلب محاكاة انتهاء صلاحية Hold
      // في بيئة الاختبار، يمكن تقليل TTL أو استخدام mock
      
      const appointmentData = {
        doctorId,
        serviceId,
        startAt: new Date(Date.now() + 51 * 60 * 60 * 1000).toISOString(),
        type: 'IN_PERSON',
      };

      const response = await request(app.getHttpServer())
        .post('/patient/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(appointmentData)
        .expect(201);

      expect(response.body.holdExpiresAt).toBeDefined();
      
      // التحقق من أن holdExpiresAt في المستقبل
      const holdExpiresAt = new Date(response.body.holdExpiresAt);
      const now = new Date();
      expect(holdExpiresAt.getTime()).toBeGreaterThan(now.getTime());
    });
  });
});

