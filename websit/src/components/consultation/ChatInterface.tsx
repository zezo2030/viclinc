'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  SendIcon,
  FileIcon,
  MoreVerticalIcon,
  DownloadIcon,
  PaperclipIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  sender: 'user' | 'doctor';
  senderName: string;
  avatar?: string;
  content: string;
  timestamp: Date;
  attachments?: { id: string; name: string; size: number; url: string }[];
  isRead: boolean;
}

interface ChatInterfaceProps {
  consultationId: string;
  doctorName: string;
  doctorAvatar?: string;
  userName: string;
  userAvatar?: string;
  onSendMessage?: (message: string, attachments?: File[]) => void;
  isDoctor?: boolean;
  initialMessages?: Message[];
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  consultationId,
  doctorName,
  doctorAvatar,
  userName,
  userAvatar,
  onSendMessage,
  isDoctor = false,
  initialMessages = [],
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && selectedFiles.length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: isDoctor ? 'doctor' : 'user',
      senderName: isDoctor ? doctorName : userName,
      avatar: isDoctor ? doctorAvatar : userAvatar,
      content: inputValue,
      timestamp: new Date(),
      attachments: selectedFiles.map((file) => ({
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
      })),
      isRead: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    setSelectedFiles([]);

    // Callback to parent
    if (onSendMessage) {
      onSendMessage(inputValue, selectedFiles);
    }

    // Simulate doctor response (if user)
    if (!isDoctor) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const response: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'doctor',
          senderName: doctorName,
          avatar: doctorAvatar,
          content: 'شكراً لرسالتك. سأقوم بمراجعتها والرد عليك قريباً.',
          timestamp: new Date(),
          isRead: false,
        };
        setMessages((prev) => [...prev, response]);
      }, 2000);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(event.target.files || [])]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card className="h-full flex flex-col border-2 border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-4 border-b border-gray-200 flex items-center justify-between rounded-t-xl">
        <div className="flex items-center gap-3">
          {(isDoctor ? doctorAvatar : userAvatar) && (
            <img
              src={isDoctor ? doctorAvatar : userAvatar}
              alt="Avatar"
              className="w-10 h-10 rounded-full"
            />
          )}
          <div>
            <h3 className="font-bold text-gray-900">{isDoctor ? doctorName : userName}</h3>
            <p className="text-xs text-gray-600">
              {isTyping ? 'جاري الكتابة...' : 'متصل'}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="text-gray-600 hover:text-gray-900"
        >
          <MoreVerticalIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {message.avatar ? (
                  <img
                    src={message.avatar}
                    alt={message.senderName}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full gradient-medical-light flex items-center justify-center text-xs font-bold text-primary-600">
                    {message.senderName.charAt(0)}
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-sm p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.url}
                        download={attachment.name}
                        className={`flex items-center gap-2 p-2 rounded text-xs ${
                          message.sender === 'user'
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-gray-200 text-gray-700'
                        } hover:opacity-80 transition-opacity`}
                      >
                        <FileIcon className="w-4 h-4" />
                        <span className="truncate">{attachment.name}</span>
                        <span className="text-xs">({formatFileSize(attachment.size)})</span>
                        <DownloadIcon className="w-3 h-3 ml-auto" />
                      </a>
                    ))}
                  </div>
                )}

                <span className="text-xs text-gray-500 mt-1">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2"
          >
            <div className="w-8 h-8 rounded-full gradient-medical-light flex items-center justify-center text-xs font-bold text-primary-600">
              {doctorName.charAt(0)}
            </div>
            <div className="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded-lg">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce animation-delay-200"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce animation-delay-400"></span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-xl">
        {/* File Preview */}
        {selectedFiles.length > 0 && (
          <div className="mb-3 space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
              >
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <FileIcon className="w-4 h-4 text-primary-600" />
                  {file.name}
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-error-600 hover:text-error-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex items-end gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none min-h-[40px] max-h-32"
            rows={1}
          />

          <Button
            size="sm"
            variant="ghost"
            onClick={handleFileSelect}
            className="text-primary-600 hover:bg-primary-100"
            title="إرفاق ملف"
          >
            <PaperclipIcon className="w-5 h-5" />
          </Button>

          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() && selectedFiles.length === 0}
            className="gradient-medical text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            title="إرسال"
          >
            <SendIcon className="w-5 h-5" />
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFilesChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
        </div>

        <p className="text-xs text-gray-500 mt-2">
          اضغط Shift + Enter للسطر الجديد
        </p>
      </div>
    </Card>
  );
};
