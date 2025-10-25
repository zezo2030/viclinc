import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Schedule (e2e)', () => {
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

  describe('/doctor/schedule (POST)', () => {
    it('should create schedule for doctor', () => {
      const scheduleData = {
        weeklyTemplate: [
          {
            dayOfWeek: 1,
            slots: [{ startTime: '09:00', endTime: '17:00' }],
            isAvailable: true,
          },
        ],
        defaultBufferBefore: 15,
        defaultBufferAfter: 15,
      };

      return request(app.getHttpServer())
        .post('/doctor/schedule')
        .send(scheduleData)
        .expect(201);
    });

    it('should return 400 for invalid time slots', () => {
      const invalidScheduleData = {
        weeklyTemplate: [
          {
            dayOfWeek: 1,
            slots: [{ startTime: '17:00', endTime: '09:00' }], // Invalid
            isAvailable: true,
          },
        ],
      };

      return request(app.getHttpServer())
        .post('/doctor/schedule')
        .send(invalidScheduleData)
        .expect(400);
    });
  });

  describe('/doctor/schedule (GET)', () => {
    it('should return doctor schedule', () => {
      return request(app.getHttpServer())
        .get('/doctor/schedule')
        .expect(200);
    });
  });

  describe('/doctor/schedule/exceptions (POST)', () => {
    it('should add exception to schedule', () => {
      const exceptionData = {
        date: '2024-01-15',
        isAvailable: false,
        reason: 'Personal leave',
      };

      return request(app.getHttpServer())
        .post('/doctor/schedule/exceptions')
        .send(exceptionData)
        .expect(201);
    });
  });

  describe('/doctor/schedule/holidays (POST)', () => {
    it('should add holiday to schedule', () => {
      const holidayData = {
        startDate: '2024-12-25',
        endDate: '2024-12-26',
        reason: 'Christmas',
      };

      return request(app.getHttpServer())
        .post('/doctor/schedule/holidays')
        .send(holidayData)
        .expect(201);
    });
  });
});

