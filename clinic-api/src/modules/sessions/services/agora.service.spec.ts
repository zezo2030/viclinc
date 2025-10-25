import { Test, TestingModule } from '@nestjs/testing';
import { AgoraService } from './agora.service';
import { SettingsService } from '../../settings/settings.service';

describe('AgoraService', () => {
  let service: AgoraService;
  let settingsService: SettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgoraService,
        {
          provide: SettingsService,
          useValue: {
            getRawAgoraSettings: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AgoraService>(AgoraService);
    settingsService = module.get<SettingsService>(SettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error when Agora is not configured', async () => {
    jest.spyOn(settingsService, 'getRawAgoraSettings').mockResolvedValue(null);

    await expect(
      service.generateToken({
        appointmentId: 'test-id',
        userId: 'user-id',
        role: 'doctor',
      })
    ).rejects.toThrow('Agora service is not configured or disabled');
  });

  it('should throw error when credentials are missing', async () => {
    jest.spyOn(settingsService, 'getRawAgoraSettings').mockResolvedValue({
      isEnabled: true,
      appId: '',
      appCertificate: '',
    });

    await expect(
      service.generateToken({
        appointmentId: 'test-id',
        userId: 'user-id',
        role: 'doctor',
      })
    ).rejects.toThrow('Agora credentials are not properly configured');
  });

  it('should generate token when properly configured', async () => {
    jest.spyOn(settingsService, 'getRawAgoraSettings').mockResolvedValue({
      isEnabled: true,
      appId: 'test-app-id',
      appCertificate: 'test-certificate',
      tokenExpirationTime: 3600,
    });

    const result = await service.generateToken({
      appointmentId: 'test-id',
      userId: 'user-id',
      role: 'doctor',
    });

    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('channelName');
    expect(result).toHaveProperty('uid');
    expect(result).toHaveProperty('expirationTime');
    expect(result.channelName).toBe('appointment-test-id');
  });
});
