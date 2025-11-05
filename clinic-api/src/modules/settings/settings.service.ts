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
    const envKey = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
    // التأكد من أن المفتاح 32 حرف على الأقل (aes-256-gcm يتطلب 32 byte)
    if (envKey.length < 32) {
      console.warn('ENCRYPTION_KEY is shorter than 32 characters, padding with zeros');
      this.encryptionKey = envKey.padEnd(32, '0');
    } else {
      this.encryptionKey = envKey;
    }
  }

  private encrypt(text: string): string {
    try {
      if (!text) {
        return '';
      }
      
      const iv = crypto.randomBytes(16);
      // استخدام أول 32 حرف فقط (aes-256-gcm يتطلب 32 byte بالضبط)
      const key = Buffer.from(this.encryptionKey.slice(0, 32), 'utf8');
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      // للحصول على authTag في GCM mode (يجب بعد final())
      const authTag = (cipher as any).getAuthTag().toString('hex');
      return iv.toString('hex') + ':' + encrypted + ':' + authTag;
    } catch (error) {
      console.error('Failed to encrypt:', error.message);
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  private decrypt(encryptedText: string): string {
    try {
      // التحقق من أن النص مشفر (يحتوي على :)
      if (!encryptedText || !encryptedText.includes(':')) {
        // إذا لم يكن مشفر، نعيده كما هو (للتوافق مع البيانات القديمة)
        return encryptedText;
      }
      
      const parts = encryptedText.split(':');
      let ivHex: string, encrypted: string;
      let authTagHex: string | null = null;
      
      if (parts.length === 2) {
        // التنسيق القديم (بدون authTag) - للتوافق مع البيانات القديمة
        [ivHex, encrypted] = parts;
      } else if (parts.length === 3) {
        // التنسيق الجديد (مع authTag)
        [ivHex, encrypted, authTagHex] = parts;
      } else {
        return encryptedText;
      }
      
      if (!ivHex || !encrypted) {
        return encryptedText;
      }
      
      const iv = Buffer.from(ivHex, 'hex');
      // استخدام أول 32 حرف فقط (aes-256-gcm يتطلب 32 byte بالضبط)
      const key = Buffer.from(this.encryptionKey.slice(0, 32), 'utf8');
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      
      // إذا كان هناك authTag، نضيفه
      if (authTagHex) {
        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
      }
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      // في حالة فشل فك التشفير، نعيد النص الأصلي
      console.error('Failed to decrypt:', error.message);
      return encryptedText;
    }
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
    try {
      const existingSettings = await this.settingsModel.findOne({ key: SettingKey.AGORA_CONFIG });
      
      let value: any = {};
      
      if (existingSettings && existingSettings.value) {
        // فك تشفير القيم الموجودة
        const decryptedValue = { ...existingSettings.value };
        if (decryptedValue.appCertificate && typeof decryptedValue.appCertificate === 'string') {
          try {
            decryptedValue.appCertificate = this.decrypt(decryptedValue.appCertificate);
          } catch (error) {
            // إذا فشل فك التشفير، نتركه فارغاً
            console.warn('Failed to decrypt existing certificate, will be replaced:', error.message);
            decryptedValue.appCertificate = '';
          }
        }
        value = { ...decryptedValue };
      }

      // تحديث القيم الجديدة
      if (updateDto.appId !== undefined && updateDto.appId !== null) {
        value.appId = updateDto.appId.trim();
      }
      
      if (updateDto.appCertificate !== undefined && updateDto.appCertificate !== null) {
        // إذا كان App Certificate فارغ، نتركه كما هو أو نحذفه
        if (updateDto.appCertificate.trim() === '') {
          // إذا كان فارغاً، نحتفظ بالقيمة القديمة إذا كانت موجودة
          if (!value.appCertificate) {
            value.appCertificate = '';
          }
        } else {
          // تشفير الشهادة قبل الحفظ
          value.appCertificate = this.encrypt(updateDto.appCertificate.trim());
        }
      }
      
      if (updateDto.tokenExpirationTime !== undefined && updateDto.tokenExpirationTime !== null) {
        value.tokenExpirationTime = updateDto.tokenExpirationTime;
      }
    
      if (updateDto.isEnabled !== undefined && updateDto.isEnabled !== null) {
        value.isEnabled = updateDto.isEnabled;
      }

      // التحقق من صحة البيانات المطلوبة
      if (value.isEnabled && (!value.appId || !value.appCertificate)) {
        throw new BadRequestException('App ID and App Certificate are required when Agora is enabled');
      }

      // التحقق من ENCRYPTION_KEY
      if (this.encryptionKey.length < 32) {
        console.warn('ENCRYPTION_KEY is shorter than 32 characters, using default padding');
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

      if (!settings) {
        throw new Error('Failed to save settings');
      }

      // فك تشفير للاستجابة (للتحقق فقط)
      const responseValue = { ...value };
      if (responseValue.appCertificate && typeof responseValue.appCertificate === 'string') {
        try {
          const decrypted = this.decrypt(responseValue.appCertificate);
          responseValue.appCertificate = this.maskSensitiveData({ appCertificate: decrypted }).appCertificate;
        } catch (error) {
          responseValue.appCertificate = '***';
        }
      }
      
      return {
        appId: responseValue.appId || '',
        appCertificate: responseValue.appCertificate || '',
        tokenExpirationTime: responseValue.tokenExpirationTime || 3600,
        isEnabled: responseValue.isEnabled || false,
        updatedBy: settings.updatedBy ? settings.updatedBy.toString() : updatedBy,
        updatedAt: settings.updatedAt || new Date(),
      };
    } catch (error) {
      console.error('Error updating Agora settings:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update Agora settings: ${error.message}`);
    }
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
    // أولاً: محاولة الحصول من قاعدة البيانات
    const settings = await this.settingsModel.findOne({ key: SettingKey.AGORA_CONFIG });
    
    if (settings) {
      const decryptedValue = { ...settings.value };
      if (decryptedValue.appCertificate) {
        decryptedValue.appCertificate = this.decrypt(decryptedValue.appCertificate);
      }
      return decryptedValue;
    }

    // ثانياً: إذا لم توجد في قاعدة البيانات، استخدام Environment Variables
    const envAppId = process.env.AGORA_APP_ID;
    const envAppCertificate = process.env.AGORA_APP_CERTIFICATE;
    const envTokenExpiration = process.env.AGORA_TOKEN_EXPIRATION_TIME;
    const envEnabled = process.env.AGORA_ENABLED;

    if (envAppId && envAppCertificate) {
      return {
        appId: envAppId,
        appCertificate: envAppCertificate,
        tokenExpirationTime: envTokenExpiration ? parseInt(envTokenExpiration, 10) : 3600,
        isEnabled: envEnabled === 'true' || envEnabled === '1',
      };
    }

    // إذا لم توجد في أي مكان
    return null;
  }
}
