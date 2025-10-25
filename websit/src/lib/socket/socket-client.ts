import { io, Socket } from 'socket.io-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class SocketClient {
  private consultationSocket: Socket | null = null;
  private messageSocket: Socket | null = null;
  private isConnected = false;

  // الاتصال بـ consultation namespace
  connectConsultation(token?: string) {
    if (this.consultationSocket?.connected) {
      return this.consultationSocket;
    }

    this.consultationSocket = io(`${API_BASE_URL}/consultation`, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    this.consultationSocket.on('connect', () => {
      console.log('Connected to consultation namespace');
      this.isConnected = true;
    });

    this.consultationSocket.on('disconnect', () => {
      console.log('Disconnected from consultation namespace');
      this.isConnected = false;
    });

    this.consultationSocket.on('connect_error', (error) => {
      console.error('Consultation connection error:', error);
    });

    return this.consultationSocket;
  }

  // الاتصال بـ messages namespace
  connectMessages(token?: string) {
    if (this.messageSocket?.connected) {
      return this.messageSocket;
    }

    this.messageSocket = io(`${API_BASE_URL}/messages`, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    this.messageSocket.on('connect', () => {
      console.log('Connected to messages namespace');
    });

    this.messageSocket.on('disconnect', () => {
      console.log('Disconnected from messages namespace');
    });

    this.messageSocket.on('connect_error', (error) => {
      console.error('Messages connection error:', error);
    });

    return this.messageSocket;
  }

  // الانضمام لاستشارة
  joinConsultation(consultationId: number, userId: number) {
    if (this.consultationSocket) {
      this.consultationSocket.emit('join-consultation', {
        consultationId,
        userId,
      });
    }
  }

  // مغادرة استشارة
  leaveConsultation(consultationId: number, userId: number) {
    if (this.consultationSocket) {
      this.consultationSocket.emit('leave-consultation', {
        consultationId,
        userId,
      });
    }
  }

  // بدء الاستشارة
  startConsultation(consultationId: number, userId: number) {
    if (this.consultationSocket) {
      this.consultationSocket.emit('start-consultation', {
        consultationId,
        userId,
      });
    }
  }

  // إنهاء الاستشارة
  endConsultation(consultationId: number, userId: number) {
    if (this.consultationSocket) {
      this.consultationSocket.emit('end-consultation', {
        consultationId,
        userId,
      });
    }
  }

  // إرسال رسالة
  sendMessage(consultationId: number, message: string, senderId: number, messageType: string = 'TEXT', fileUrl?: string) {
    if (this.messageSocket) {
      this.messageSocket.emit('send-message', {
        consultationId,
        message,
        senderId,
        messageType,
        fileUrl,
      });
    }
  }

  // إرسال حالة الكتابة
  sendTyping(consultationId: number, userId: number, isTyping: boolean) {
    if (this.messageSocket) {
      this.messageSocket.emit('typing', {
        consultationId,
        userId,
        isTyping,
      });
    }
  }

  // تحديد رسالة كمقروءة
  markMessageAsRead(messageId: number, userId: number, consultationId: number) {
    if (this.messageSocket) {
      this.messageSocket.emit('message-read', {
        messageId,
        userId,
        consultationId,
      });
    }
  }

  // الانضمام لرسائل الاستشارة
  joinConsultationMessages(consultationId: number, userId: number) {
    if (this.messageSocket) {
      this.messageSocket.emit('join-consultation-messages', {
        consultationId,
        userId,
      });
    }
  }

  // مغادرة رسائل الاستشارة
  leaveConsultationMessages(consultationId: number, userId: number) {
    if (this.messageSocket) {
      this.messageSocket.emit('leave-consultation-messages', {
        consultationId,
        userId,
      });
    }
  }

  // الاستماع لأحداث الاستشارة
  onConsultationEvent(event: string, callback: (data: any) => void) {
    if (this.consultationSocket) {
      this.consultationSocket.on(event, callback);
    }
  }

  // الاستماع لأحداث الرسائل
  onMessageEvent(event: string, callback: (data: any) => void) {
    if (this.messageSocket) {
      this.messageSocket.on(event, callback);
    }
  }

  // إزالة مستمع الأحداث
  offConsultationEvent(event: string, callback?: (data: any) => void) {
    if (this.consultationSocket) {
      this.consultationSocket.off(event, callback);
    }
  }

  offMessageEvent(event: string, callback?: (data: any) => void) {
    if (this.messageSocket) {
      this.messageSocket.off(event, callback);
    }
  }

  // قطع الاتصال
  disconnect() {
    if (this.consultationSocket) {
      this.consultationSocket.disconnect();
      this.consultationSocket = null;
    }
    if (this.messageSocket) {
      this.messageSocket.disconnect();
      this.messageSocket = null;
    }
    this.isConnected = false;
  }

  // الحصول على حالة الاتصال
  getConnectionStatus() {
    return {
      consultation: this.consultationSocket?.connected || false,
      messages: this.messageSocket?.connected || false,
      isConnected: this.isConnected,
    };
  }
}

// إنشاء instance واحد للاستخدام في التطبيق
export const socketClient = new SocketClient();
