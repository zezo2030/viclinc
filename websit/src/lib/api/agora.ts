import { apiClient } from './client';

export interface AgoraToken {
  appId: string;
  channel: string;
  token: string;
  uid: number;
  role: string;
  expirationTime: number;
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
  // الحصول على Agora token
  async getToken(channelName: string, uid: number, role: string = 'publisher'): Promise<AgoraToken> {
    const response = await apiClient.post('/agora/token', {
      channelName,
      uid,
      role,
    });
    return (response as any).data;
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
