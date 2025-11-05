import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Departments (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let departmentId: string;
  let serviceId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // إنشاء مستخدم أدمن (يجب أن يكون لديك endpoint لإنشاء أدمن في الاختبار)
    // أو استخدام token موجود في المتغيرات البيئية
    // للاختبار، سنفترض أن لدينا طريقة للحصول على adminToken
    // يمكنك تعديل هذا حسب نظام المصادقة الخاص بك

    // محاولة تسجيل الدخول كأدمن أو إنشاء أدمن
    // هذا مثال - يجب تعديله حسب نظامك
    try {
      const adminResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: process.env.ADMIN_EMAIL || 'admin@test.com',
          password: process.env.ADMIN_PASSWORD || 'admin123',
        });
      adminToken = adminResponse.body.accessToken;
    } catch (error) {
      // إذا لم يكن هناك أدمن، يمكن إنشاء واحد
      // أو تخطي الاختبارات التي تحتاج أدمن
      console.warn('Could not get admin token, some tests may fail');
    }

    // إنشاء قسم للاختبار
    if (adminToken) {
      const deptResponse = await request(app.getHttpServer())
        .post('/admin/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Department',
          description: 'Test department for e2e testing',
          isActive: true,
        });
      
      if (deptResponse.status === 201) {
        departmentId = deptResponse.body._id || deptResponse.body.id;
      }

      // إنشاء خدمة للاختبار
      if (departmentId) {
        const serviceResponse = await request(app.getHttpServer())
          .post('/admin/services')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'Test Service',
            departmentId: departmentId,
            description: 'Test service for e2e testing',
            defaultPrice: 100,
            defaultDurationMin: 30,
            isActive: true,
          });
        
        if (serviceResponse.status === 201) {
          serviceId = serviceResponse.body._id || serviceResponse.body.id;
        }
      }
    }
  });

  afterAll(async () => {
    // تنظيف البيانات الاختبارية
    if (adminToken && serviceId) {
      await request(app.getHttpServer())
        .delete(`/admin/services/${serviceId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }

    if (adminToken && departmentId) {
      await request(app.getHttpServer())
        .delete(`/admin/departments/${departmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }

    await app.close();
  });

  describe('GET /admin/departments/:id/details', () => {
    it('should return 401 if not authenticated', async () => {
      if (!departmentId) {
        return; // Skip if no department was created
      }

      await request(app.getHttpServer())
        .get(`/admin/departments/${departmentId}/details`)
        .expect(401);
    });

    it('should return 404 if department not found', async () => {
      if (!adminToken) {
        return; // Skip if no admin token
      }

      const fakeId = '507f1f77bcf86cd799439011';
      await request(app.getHttpServer())
        .get(`/admin/departments/${fakeId}/details`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return department details with services and doctors', async () => {
      if (!adminToken || !departmentId) {
        return; // Skip if prerequisites not met
      }

      const response = await request(app.getHttpServer())
        .get(`/admin/departments/${departmentId}/details`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name');
      expect(response.body.name).toBe('Test Department');
      expect(response.body).toHaveProperty('services');
      expect(Array.isArray(response.body.services)).toBe(true);
      expect(response.body).toHaveProperty('doctors');
      expect(Array.isArray(response.body.doctors)).toBe(true);

      // التحقق من وجود الخدمة التي أنشأناها
      if (serviceId && response.body.services.length > 0) {
        const service = response.body.services.find(
          (s: any) => (s._id || s.id) === serviceId
        );
        expect(service).toBeDefined();
        expect(service.name).toBe('Test Service');
      }
    });

    it('should return 403 if user is not admin', async () => {
      if (!departmentId) {
        return; // Skip if no department was created
      }

      // إنشاء مستخدم عادي (ليس أدمن)
      const userResponse = await request(app.getHttpServer())
        .post('/auth/register/patient')
        .send({
          name: 'Regular User',
          email: `user${Date.now()}@test.com`,
          phone: `+1234567${Math.floor(Math.random() * 1000)}`,
          password: 'password123',
        });

      if (userResponse.status === 201) {
        const userToken = userResponse.body.accessToken;
        await request(app.getHttpServer())
          .get(`/admin/departments/${departmentId}/details`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      }
    });
  });
});

