import { apiClient } from './client';

export interface UploadedFile {
  fileName: string;
  url: string;
  size: number;
  type: string;
}

export const fileUploadService = {
  // رفع ملف واحد
  async uploadFile(file: File, folder: string = 'consultations'): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await apiClient.request('/file-upload/single', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return (response as any).data;
  },

  // رفع عدة ملفات
  async uploadMultipleFiles(files: File[], folder: string = 'consultations'): Promise<UploadedFile[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('folder', folder);

    const response = await apiClient.request('/file-upload/multiple', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return (response as any).data;
  },

  // حذف ملف
  async deleteFile(fileName: string, folder: string = 'consultations'): Promise<void> {
    await apiClient.delete(`/file-upload/${folder}/${fileName}`);
  },
};
