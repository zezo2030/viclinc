import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { DoctorSchedule } from '../schemas/doctor-schedule.schema';
import { DoctorProfile } from '../../doctors/schemas/doctor-profile.schema';
import { DoctorService } from '../../doctors/schemas/doctor-service.schema';
import { Service } from '../../services/schemas/service.schema';

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let mockScheduleModel: any;
  let mockDoctorProfileModel: any;
  let mockDoctorServiceModel: any;
  let mockServiceModel: any;

  beforeEach(async () => {
    const mockSchedule = {
      _id: 'schedule-id',
      doctorId: 'doctor-id',
      weeklyTemplate: [
        {
          dayOfWeek: 1, // Monday
          slots: [{ startTime: '09:00', endTime: '17:00' }],
          isAvailable: true,
        },
      ],
      defaultBufferBefore: 15,
      defaultBufferAfter: 15,
      serviceBuffers: [],
      exceptions: [],
      holidays: [],
    };

    const mockDoctor = {
      _id: 'doctor-id',
      name: 'Dr. Test',
      status: 'APPROVED',
    };

    const mockService = {
      _id: 'service-id',
      name: 'Consultation',
      defaultDurationMin: 30,
    };

    const mockDoctorService = {
      _id: 'doctor-service-id',
      doctorId: 'doctor-id',
      serviceId: 'service-id',
      customDuration: 45,
      isActive: true,
    };

    mockScheduleModel = {
      findOne: jest.fn(),
    };

    mockDoctorProfileModel = {
      findById: jest.fn(),
    };

    mockDoctorServiceModel = {
      findOne: jest.fn(),
    };

    mockServiceModel = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        {
          provide: getModelToken(DoctorSchedule.name),
          useValue: mockScheduleModel,
        },
        {
          provide: getModelToken(DoctorProfile.name),
          useValue: mockDoctorProfileModel,
        },
        {
          provide: getModelToken(DoctorService.name),
          useValue: mockDoctorServiceModel,
        },
        {
          provide: getModelToken(Service.name),
          useValue: mockServiceModel,
        },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
  });

  describe('getDoctorAvailability', () => {
    it('should return availability for valid doctor and service', async () => {
      mockDoctorProfileModel.findById.mockResolvedValue({ _id: 'doctor-id' });
      mockServiceModel.findById.mockResolvedValue({ _id: 'service-id' });
      mockDoctorServiceModel.findOne.mockResolvedValue({
        _id: 'doctor-service-id',
        customDuration: 45,
        isActive: true,
      });
      mockScheduleModel.findOne.mockResolvedValue({
        _id: 'schedule-id',
        doctorId: 'doctor-id',
        weeklyTemplate: [
          {
            dayOfWeek: 1,
            slots: [{ startTime: '09:00', endTime: '17:00' }],
            isAvailable: true,
          },
        ],
        defaultBufferBefore: 15,
        defaultBufferAfter: 15,
        serviceBuffers: [],
        exceptions: [],
        holidays: [],
      });

      const result = await service.getDoctorAvailability('doctor-id', 'service-id');

      expect(result.doctorId).toBe('doctor-id');
      expect(result.serviceId).toBe('service-id');
      expect(result.availableSlots).toBeDefined();
    });

    it('should throw error when doctor not found', async () => {
      mockDoctorProfileModel.findById.mockResolvedValue(null);

      await expect(service.getDoctorAvailability('invalid-id', 'service-id'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw error when service not found', async () => {
      mockDoctorProfileModel.findById.mockResolvedValue({ _id: 'doctor-id' });
      mockServiceModel.findById.mockResolvedValue(null);

      await expect(service.getDoctorAvailability('doctor-id', 'invalid-id'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw error when doctor does not provide service', async () => {
      mockDoctorProfileModel.findById.mockResolvedValue({ _id: 'doctor-id' });
      mockServiceModel.findById.mockResolvedValue({ _id: 'service-id' });
      mockDoctorServiceModel.findOne.mockResolvedValue(null);

      await expect(service.getDoctorAvailability('doctor-id', 'service-id'))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw error when schedule not found', async () => {
      mockDoctorProfileModel.findById.mockResolvedValue({ _id: 'doctor-id' });
      mockServiceModel.findById.mockResolvedValue({ _id: 'service-id' });
      mockDoctorServiceModel.findOne.mockResolvedValue({
        _id: 'doctor-service-id',
        isActive: true,
      });
      mockScheduleModel.findOne.mockResolvedValue(null);

      await expect(service.getDoctorAvailability('doctor-id', 'service-id'))
        .rejects.toThrow(NotFoundException);
    });
  });
});

