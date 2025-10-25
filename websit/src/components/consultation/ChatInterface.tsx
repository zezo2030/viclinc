'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Send, Paperclip, Image, FileText } from 'lucide-react';
import { socketClient } from '@/lib/socket/socket-client';
import { messageService, Message } from '@/lib/api/messages';
import { useAuth } from '@/lib/contexts/auth-context';

interface ChatInterfaceProps {
  consultationId: number;
  onFileUpload?: (file: File) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  consultationId,
  onFileUpload,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadMessages();
    setupSocketListeners();
    
    return () => {
      cleanup();
    };
  }, [consultationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const messagesData = await messageService.getMessagesByConsultation(consultationId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('فشل في تحميل الرسائل');
    } finally {
      setIsLoading(false);
    }
  };

  const setupSocketListeners = () => {
    // الانضمام لرسائل الاستشارة
    socketClient.joinConsultationMessages(consultationId, user?.id ? parseInt(user.id) : 0);

    // الاستماع للرسائل الجديدة
    socketClient.onMessageEvent('new-message', (data) => {
      if (data.consultationId === consultationId) {
        setMessages(prev => [...prev, {
          id: Date.now(), // مؤقت
          consultationId: data.consultationId,
          senderId: data.senderId,
          message: data.message,
          messageType: data.messageType || 'TEXT',
          fileUrl: data.fileUrl,
          isRead: false,
          createdAt: data.timestamp,
          sender: {
            id: data.senderId,
            email: '',
            profile: {
              firstName: 'مستخدم',
              lastName: '',
            },
          },
        }]);
      }
    });

    // الاستماع لحالة الكتابة
    socketClient.onMessageEvent('user-typing', (data) => {
      if (data.consultationId === consultationId) {
        setTypingUsers(data.typingUsers || []);
      }
    });

    // الاستماع لحالة قراءة الرسائل
    socketClient.onMessageEvent('message-read-status', (data) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId ? { ...msg, isRead: true } : msg
      ));
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      // إرسال الرسالة عبر Socket
      socketClient.sendMessage(
        consultationId,
        newMessage,
        parseInt(user.id),
        'TEXT'
      );

      // إضافة الرسالة للقائمة محلياً
      const tempMessage: Message = {
        id: Date.now(),
        consultationId,
        senderId: parseInt(user.id),
        message: newMessage,
        messageType: 'TEXT',
        isRead: false,
        createdAt: new Date().toISOString(),
        sender: {
          id: parseInt(user.id),
          email: user.email || '',
          profile: {
            firstName: user.name || 'أنت',
            lastName: '',
          },
        },
      };

      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');

      // إيقاف حالة الكتابة
      handleTyping(false);

    } catch (error) {
      console.error('Error sending message:', error);
      setError('فشل في إرسال الرسالة');
    }
  };

  const handleTyping = (typing: boolean) => {
    if (typing) {
      socketClient.sendTyping(consultationId, user?.id ? parseInt(user.id) : 0, true);
      
      // إيقاف حالة الكتابة بعد 3 ثوان
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        handleTyping(false);
      }, 3000);
    } else {
      socketClient.sendTyping(consultationId, user?.id ? parseInt(user.id) : 0, false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
    setIsTyping(typing);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const cleanup = () => {
    socketClient.leaveConsultationMessages(consultationId, user?.id ? parseInt(user.id) : 0);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p>جاري تحميل الرسائل...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button onClick={loadMessages} className="mt-4">
            إعادة المحاولة
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">الدردشة</h3>
        
        {/* منطقة الرسائل */}
        <div className="h-64 overflow-y-auto border rounded-lg p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>لا توجد رسائل بعد</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === parseInt(user?.id || '0') ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.senderId === parseInt(user?.id || '0')
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium">
                      {message.sender.profile.firstName}
                    </span>
                    <span className="text-xs opacity-75">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm">{message.message}</p>
                  {message.fileUrl && (
                    <div className="mt-2">
                      {message.messageType === 'IMAGE' ? (
                        <img
                          src={message.fileUrl}
                          alt="مرفق"
                          className="max-w-full h-auto rounded"
                        />
                      ) : (
                        <a
                          href={message.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-300 hover:text-blue-200 underline"
                        >
                          📎 ملف مرفق
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          {/* مؤشر الكتابة */}
          {typingUsers.length > 0 && (
            <div className="text-sm text-gray-500 italic">
              {typingUsers.length === 1 ? 'شخص واحد يكتب...' : `${typingUsers.length} أشخاص يكتبون...`}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* منطقة إدخال الرسالة */}
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping(true);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1"
          />
          
          <input
            type="file"
            id="file-upload"
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          
          <label htmlFor="file-upload">
            <Button variant="outline" size="sm" type="button">
              <Paperclip className="w-4 h-4" />
            </Button>
          </label>
          
          <Button onClick={sendMessage} disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
