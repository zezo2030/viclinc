import { apiClient } from './client';

export interface AgoraToken {
  appId: string;
  channel: string;
  token: string;
  uid: number;
  role: string;
  expirationTime: number;
}

export interface VideoTokenResponse {
  token: string;
  channelName: string;
  uid: number;
  expirationTime: number;
  appId: string;
  sessionStatus: string;
  canJoin: boolean;
}

export interface AgoraChannel {
  channelName: string;
}

export interface AgoraRecording {
  channel: string;
  recordingConfig: {
    maxIdleTime: number;
    streamTypes: number;
    audioProfile: number;
    videoStreamType: number;
    channelType: number;
    subscribeVideoUids: number[];
    subscribeAudioUids: number[];
    subscribeUidGroup: number;
  };
}

export const agoraService = {
  // الحصول على Agora App ID (public)
  async getAppId(): Promise<{ appId: string }> {
    return apiClient.get('/sessions/video/app-id');
  },

  // الحصول على Agora token للجلسة
  async getToken(appointmentId: string, role: 'doctor' | 'patient', testMode: boolean = false): Promise<VideoTokenResponse> {
    const headers: Record<string, string> = {};
    if (testMode) {
      headers['x-test-mode'] = 'true';
    }
    return apiClient.post('/sessions/video/token', {
      appointmentId,
      role,
    }, { headers });
  },

  // إنشاء قناة جديدة
  async createChannel(consultationId: number): Promise<AgoraChannel> {
    const response = await apiClient.post('/agora/channel', {
      consultationId,
    });
    return (response as any).data;
  },

  // بدء التسجيل
  async startRecording(channelName: string): Promise<AgoraRecording> {
    const response = await apiClient.post('/agora/recording', {
      channelName,
    });
    return (response as any).data;
  },

  // التحقق من صحة الـ token
  async validateToken(token: string, channelName: string, uid: number): Promise<boolean> {
    const response = await apiClient.post('/agora/validate', {
      token,
      channelName,
      uid,
    });
    return (response as any).data;
  },

  // الحصول على معلومات القناة
  async getChannelInfo(channelName: string): Promise<{ channelName: string; isActive: boolean; participantCount: number }> {
    const response = await apiClient.post('/agora/channel-info', {
      channelName,
    });
    return (response as any).data;
  },
};
