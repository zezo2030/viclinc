import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Availability (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/clinic_test'),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/patient/doctors (GET)', () => {
    it('should return list of doctors', () => {
      return request(app.getHttpServer())
        .get('/patient/doctors')
        .expect(200);
    });

    it('should filter doctors by department', () => {
      return request(app.getHttpServer())
        .get('/patient/doctors?departmentId=department-id')
        .expect(200);
    });

    it('should filter doctors by service', () => {
      return request(app.getHttpServer())
        .get('/patient/doctors?serviceId=service-id')
        .expect(200);
    });
  });

  describe('/patient/doctors/:id (GET)', () => {
    it('should return doctor details', () => {
      return request(app.getHttpServer())
        .get('/patient/doctors/doctor-id')
        .expect(200);
    });

    it('should return 404 for non-existent doctor', () => {
      return request(app.getHttpServer())
        .get('/patient/doctors/non-existent-id')
        .expect(404);
    });
  });

  describe('/patient/doctors/:id/availability (GET)', () => {
    it('should return doctor availability', () => {
      return request(app.getHttpServer())
        .get('/patient/doctors/doctor-id/availability?serviceId=service-id')
        .expect(200);
    });

    it('should return 400 when serviceId is missing', () => {
      return request(app.getHttpServer())
        .get('/patient/doctors/doctor-id/availability')
        .expect(400);
    });

    it('should return 404 for non-existent doctor', () => {
      return request(app.getHttpServer())
        .get('/patient/doctors/non-existent-id/availability?serviceId=service-id')
        .expect(404);
    });
  });
});

