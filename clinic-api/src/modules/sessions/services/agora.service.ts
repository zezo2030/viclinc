import { Injectable, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';
import { RtcTokenBuilder, RtcRole } from 'agora-token';

export interface AgoraTokenRequest {
  appointmentId: string;
  userId: string;
  role: 'doctor' | 'patient';
}

export interface AgoraTokenResponse {
  token: string;
  channelName: string;
  uid: number;
  expirationTime: number;
}

@Injectable()
export class AgoraService {
  constructor(private readonly settingsService: SettingsService) {}

  async generateToken(request: AgoraTokenRequest): Promise<AgoraTokenResponse> {
    const settings = await this.settingsService.getRawAgoraSettings();
    
    if (!settings || !settings.isEnabled) {
      throw new ServiceUnavailableException('Agora service is not configured or disabled');
    }

    if (!settings.appId || !settings.appCertificate) {
      throw new ServiceUnavailableException('Agora credentials are not properly configured');
    }

    try {
      const channelName = `appointment-${request.appointmentId}`;
      const uid = this.generateUid(request.userId);
      const expirationTime = settings.tokenExpirationTime || 3600;
      
      // تحديد دور Agora حسب دور المستخدم
      const agoraRole = request.role === 'doctor' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
      
      const token = RtcTokenBuilder.buildTokenWithUid(
        settings.appId,
        settings.appCertificate,
        channelName,
        uid,
        agoraRole,
        expirationTime,
        expirationTime // privilegeExpire
      );

      return {
        token,
        channelName,
        uid,
        expirationTime,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to generate Agora token: ${error.message}`);
    }
  }

  async validateChannelAccess(channelName: string, userId: string): Promise<boolean> {
    // التحقق من أن المستخدم مخول للوصول لهذه القناة
    // يمكن إضافة منطق إضافي هنا للتحقق من الصلاحيات
    return channelName.startsWith('appointment-') && !!userId;
  }

  private generateUid(userId: string): number {
    // تحويل userId إلى رقم فريد للـ Agora
    // يمكن استخدام hash أو تحويل مباشر
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // تحويل إلى 32-bit integer
    }
    return Math.abs(hash) % 1000000; // Agora يدعم UIDs حتى 2^32-1
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const settings = await this.settingsService.getRawAgoraSettings();
      
      if (!settings || !settings.isEnabled) {
        return {
          success: false,
          message: 'Agora is not enabled'
        };
      }

      if (!settings.appId || !settings.appCertificate) {
        return {
          success: false,
          message: 'Agora credentials are missing'
        };
      }

      // اختبار توليد توكن تجريبي
      const testToken = RtcTokenBuilder.buildTokenWithUid(
        settings.appId,
        settings.appCertificate,
        'test-channel',
        12345,
        RtcRole.PUBLISHER,
        60,
        60 // privilegeExpire
      );

      if (!testToken) {
        return {
          success: false,
          message: 'Failed to generate test token'
        };
      }

      return {
        success: true,
        message: 'Agora connection test successful'
      };
    } catch (error) {
      return {
        success: false,
        message: `Agora test failed: ${error.message}`
      };
    }
  }
}
