'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Upload, File, Image, X, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileUpload: (file: File) => Promise<string>;
  maxFileSize?: number; // بالبايت
  allowedTypes?: string[];
  className?: string;
}

interface UploadedFile {
  file: File;
  url?: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileUpload,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  className,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `حجم الملف يتجاوز الحد المسموح (${formatFileSize(maxFileSize)})`;
    }

    if (!allowedTypes.includes(file.type)) {
      return `نوع الملف غير مسموح. الأنواع المسموحة: ${allowedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const error = validateFile(file);
      
      if (error) {
        setUploadedFiles(prev => [...prev, {
          file,
          progress: 0,
          status: 'error',
          error,
        }]);
        continue;
      }

      // إضافة الملف للقائمة
      const uploadedFile: UploadedFile = {
        file,
        progress: 0,
        status: 'uploading',
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);

      try {
        // استدعاء callback للملف
        onFileSelect(file);

        // رفع الملف
        const url = await onFileUpload(file);
        
        setUploadedFiles(prev => prev.map(f => 
          f.file === file 
            ? { ...f, url, progress: 100, status: 'completed' }
            : f
        ));
      } catch (error) {
        setUploadedFiles(prev => prev.map(f => 
          f.file === file 
            ? { ...f, progress: 0, status: 'error', error: 'فشل في رفع الملف' }
            : f
        ));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const removeFile = (file: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== file));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {/* منطقة السحب والإفلات */}
      <Card 
        className={`p-6 border-2 border-dashed transition-colors ${
          isDragOver 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            اسحب الملفات هنا أو انقر للاختيار
          </p>
          <p className="text-sm text-gray-500 mb-4">
            الحد الأقصى: {formatFileSize(maxFileSize)}
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
          >
            اختيار ملفات
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInputChange}
            accept={allowedTypes.join(',')}
            className="hidden"
          />
        </div>
      </Card>

      {/* قائمة الملفات المرفوعة */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-gray-700">الملفات المرفوعة:</h4>
          {uploadedFiles.map((uploadedFile, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getFileIcon(uploadedFile.file)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadedFile.file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {uploadedFile.status === 'uploading' && (
                    <div className="w-16">
                      <Progress value={uploadedFile.progress} className="h-2" />
                    </div>
                  )}
                  
                  {getStatusIcon(uploadedFile.status)}
                  
                  <Button
                    onClick={() => removeFile(uploadedFile.file)}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {uploadedFile.error && (
                <p className="text-sm text-red-600 mt-2">
                  {uploadedFile.error}
                </p>
              )}

              {uploadedFile.url && (
                <div className="mt-2">
                  <a
                    href={uploadedFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    عرض الملف
                  </a>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
