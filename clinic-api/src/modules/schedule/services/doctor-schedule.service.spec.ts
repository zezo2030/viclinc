import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DoctorScheduleService } from './doctor-schedule.service';
import { DoctorSchedule } from '../schemas/doctor-schedule.schema';
import { CreateScheduleDto } from '../dto/create-schedule.dto';
import { AddExceptionDto } from '../dto/add-exception.dto';
import { AddHolidayDto } from '../dto/add-holiday.dto';

describe('DoctorScheduleService', () => {
  let service: DoctorScheduleService;
  let mockModel: any;

  beforeEach(async () => {
    const mockSchedule = {
      _id: 'schedule-id',
      doctorId: 'doctor-id',
      weeklyTemplate: [],
      defaultBufferBefore: 0,
      defaultBufferAfter: 0,
      serviceBuffers: [],
      exceptions: [],
      holidays: [],
      save: jest.fn(),
    };

    mockModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctorScheduleService,
        {
          provide: getModelToken(DoctorSchedule.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<DoctorScheduleService>(DoctorScheduleService);
  });

  describe('createOrUpdateSchedule', () => {
    it('should create new schedule when none exists', async () => {
      const createDto: CreateScheduleDto = {
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

      mockModel.findOne.mockResolvedValue(null);
      mockModel.create.mockResolvedValue(mockSchedule);

      const result = await service.createOrUpdateSchedule('doctor-id', createDto);

      expect(mockModel.findOne).toHaveBeenCalledWith({ doctorId: 'doctor-id' });
      expect(mockModel.create).toHaveBeenCalled();
      expect(result).toBe(mockSchedule);
    });

    it('should update existing schedule', async () => {
      const createDto: CreateScheduleDto = {
        weeklyTemplate: [
          {
            dayOfWeek: 1,
            slots: [{ startTime: '09:00', endTime: '17:00' }],
            isAvailable: true,
          },
        ],
      };

      mockModel.findOne.mockResolvedValue(mockSchedule);
      mockSchedule.save.mockResolvedValue(mockSchedule);

      const result = await service.createOrUpdateSchedule('doctor-id', createDto);

      expect(mockSchedule.save).toHaveBeenCalled();
      expect(result).toBe(mockSchedule);
    });

    it('should throw error for invalid time slots', async () => {
      const createDto: CreateScheduleDto = {
        weeklyTemplate: [
          {
            dayOfWeek: 1,
            slots: [{ startTime: '17:00', endTime: '09:00' }], // Invalid
            isAvailable: true,
          },
        ],
      };

      await expect(service.createOrUpdateSchedule('doctor-id', createDto))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('getSchedule', () => {
    it('should return schedule when found', async () => {
      mockModel.findOne.mockResolvedValue(mockSchedule);

      const result = await service.getSchedule('doctor-id');

      expect(result).toBe(mockSchedule);
    });

    it('should throw error when schedule not found', async () => {
      mockModel.findOne.mockResolvedValue(null);

      await expect(service.getSchedule('doctor-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('addException', () => {
    it('should add exception successfully', async () => {
      const addExceptionDto: AddExceptionDto = {
        date: '2024-01-15',
        isAvailable: false,
        reason: 'Personal leave',
      };

      mockModel.findOne.mockResolvedValue(mockSchedule);
      mockSchedule.save.mockResolvedValue(mockSchedule);

      const result = await service.addException('doctor-id', addExceptionDto);

      expect(mockSchedule.exceptions).toHaveLength(1);
      expect(mockSchedule.save).toHaveBeenCalled();
      expect(result).toBe(mockSchedule);
    });

    it('should throw error for duplicate exception date', async () => {
      const addExceptionDto: AddExceptionDto = {
        date: '2024-01-15',
        isAvailable: false,
      };

      mockSchedule.exceptions = [
        {
          date: new Date('2024-01-15'),
          slots: [],
          isAvailable: false,
          reason: '',
        },
      ];

      mockModel.findOne.mockResolvedValue(mockSchedule);

      await expect(service.addException('doctor-id', addExceptionDto))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('addHoliday', () => {
    it('should add holiday successfully', async () => {
      const addHolidayDto: AddHolidayDto = {
        startDate: '2024-12-25',
        endDate: '2024-12-26',
        reason: 'Christmas',
      };

      mockModel.findOne.mockResolvedValue(mockSchedule);
      mockSchedule.save.mockResolvedValue(mockSchedule);

      const result = await service.addHoliday('doctor-id', addHolidayDto);

      expect(mockSchedule.holidays).toHaveLength(1);
      expect(mockSchedule.save).toHaveBeenCalled();
      expect(result).toBe(mockSchedule);
    });

    it('should throw error for invalid date range', async () => {
      const addHolidayDto: AddHolidayDto = {
        startDate: '2024-12-26',
        endDate: '2024-12-25', // Invalid
        reason: 'Christmas',
      };

      mockModel.findOne.mockResolvedValue(mockSchedule);

      await expect(service.addHoliday('doctor-id', addHolidayDto))
        .rejects.toThrow(BadRequestException);
    });
  });
});

