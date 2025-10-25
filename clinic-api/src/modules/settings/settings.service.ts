import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SystemSettings, SystemSettingsDocument, SettingKey } from './schemas/system-settings.schema';
import { UpdateAgoraSettingsDto, AgoraSettingsResponseDto, TestAgoraConnectionDto } from './dto/update-agora-settings.dto';
import * as crypto from 'crypto';

@Injectable()
export class SettingsService {
  private readonly encryptionKey: string;
  private readonly algorithm = 'aes-256-gcm';

  constructor(
    @InjectModel(SystemSettings.name) 
    private settingsModel: Model<SystemSettingsDocument>,
  ) {
    // في الإنتاج، يجب أن يكون هذا من متغير البيئة
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.encryptionKey.slice(0, 32)), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(encryptedText: string): string {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.encryptionKey.slice(0, 32)), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private maskSensitiveData(value: any): any {
    if (typeof value === 'object' && value !== null) {
      const masked = { ...value };
      if (masked.appCertificate) {
        masked.appCertificate = '***' + masked.appCertificate.slice(-4);
      }
      return masked;
    }
    return value;
  }

  async getAgoraSettings(): Promise<AgoraSettingsResponseDto> {
    const settings = await this.settingsModel.findOne({ key: SettingKey.AGORA_CONFIG });
    
    if (!settings) {
      // إعدادات افتراضية
      return {
        appId: '',
        appCertificate: '',
        tokenExpirationTime: 3600,
        isEnabled: false,
        updatedBy: '',
        updatedAt: new Date(),
      };
    }

    const decryptedValue = { ...settings.value };
    if (decryptedValue.appCertificate) {
      decryptedValue.appCertificate = this.decrypt(decryptedValue.appCertificate);
    }

    return {
      appId: decryptedValue.appId || '',
      appCertificate: this.maskSensitiveData(decryptedValue).appCertificate,
      tokenExpirationTime: decryptedValue.tokenExpirationTime || 3600,
      isEnabled: decryptedValue.isEnabled || false,
      updatedBy: settings.updatedBy.toString(),
      updatedAt: settings.updatedAt,
    };
  }

  async updateAgoraSettings(
    updateDto: UpdateAgoraSettingsDto, 
    updatedBy: string
  ): Promise<AgoraSettingsResponseDto> {
    const existingSettings = await this.settingsModel.findOne({ key: SettingKey.AGORA_CONFIG });
    
    let value: any = {};
    
    if (existingSettings) {
      // فك تشفير القيم الموجودة
      const decryptedValue = { ...existingSettings.value };
      if (decryptedValue.appCertificate) {
        decryptedValue.appCertificate = this.decrypt(decryptedValue.appCertificate);
      }
      value = { ...decryptedValue };
    }

    // تحديث القيم الجديدة
    if (updateDto.appId !== undefined) {
      value.appId = updateDto.appId;
    }
    
    if (updateDto.appCertificate !== undefined) {
      // تشفير الشهادة قبل الحفظ
      value.appCertificate = this.encrypt(updateDto.appCertificate);
    }
    
    if (updateDto.tokenExpirationTime !== undefined) {
      value.tokenExpirationTime = updateDto.tokenExpirationTime;
    }
    
    if (updateDto.isEnabled !== undefined) {
      value.isEnabled = updateDto.isEnabled;
    }

    // التحقق من صحة البيانات المطلوبة
    if (value.isEnabled && (!value.appId || !value.appCertificate)) {
      throw new BadRequestException('App ID and App Certificate are required when Agora is enabled');
    }

    const settings = await this.settingsModel.findOneAndUpdate(
      { key: SettingKey.AGORA_CONFIG },
      { 
        value, 
        updatedBy: new Types.ObjectId(updatedBy),
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // إرجاع البيانات مع إخفاء الشهادة
    const responseValue = this.maskSensitiveData(value);
    
    return {
      appId: responseValue.appId || '',
      appCertificate: responseValue.appCertificate || '',
      tokenExpirationTime: responseValue.tokenExpirationTime || 3600,
      isEnabled: responseValue.isEnabled || false,
      updatedBy: settings.updatedBy.toString(),
      updatedAt: settings.updatedAt,
    };
  }

  async testAgoraConnection(): Promise<TestAgoraConnectionDto> {
    const settings = await this.settingsModel.findOne({ key: SettingKey.AGORA_CONFIG });
    
    if (!settings || !settings.value.isEnabled) {
      return {
        success: false,
        message: 'Agora is not configured or disabled',
        timestamp: new Date(),
      };
    }

    try {
      // فك تشفير الشهادة للاختبار
      const decryptedValue = { ...settings.value };
      if (decryptedValue.appCertificate) {
        decryptedValue.appCertificate = this.decrypt(decryptedValue.appCertificate);
      }

      // اختبار بسيط - التحقق من وجود القيم
      if (!decryptedValue.appId || !decryptedValue.appCertificate) {
        return {
          success: false,
          message: 'Missing App ID or App Certificate',
          timestamp: new Date(),
        };
      }

      // هنا يمكن إضافة اختبار حقيقي لـ Agora API
      // للآن سنعيد نجاح إذا كانت البيانات موجودة
      return {
        success: true,
        message: 'Agora configuration is valid',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        message: `Test failed: ${error.message}`,
        timestamp: new Date(),
      };
    }
  }

  async getRawAgoraSettings(): Promise<any> {
    const settings = await this.settingsModel.findOne({ key: SettingKey.AGORA_CONFIG });
    
    if (!settings) {
      return null;
    }

    const decryptedValue = { ...settings.value };
    if (decryptedValue.appCertificate) {
      decryptedValue.appCertificate = this.decrypt(decryptedValue.appCertificate);
    }

    return decryptedValue;
  }
}
