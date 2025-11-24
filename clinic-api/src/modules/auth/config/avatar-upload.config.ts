import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import type { Request } from 'express';

const maxFileSize = parseInt(process.env.MAX_AVATAR_SIZE_MB || '5') * 1024 * 1024;
const uploadsDir = join(process.cwd(), 'uploads', 'avatars');

// إنشاء المجلد إذا لم يكن موجوداً
if (!existsSync(uploadsDir)) {
  try {
    mkdirSync(uploadsDir, { recursive: true });
    console.log(`[Avatar Upload] Created uploads directory: ${uploadsDir}`);
  } catch (error) {
    console.error(`[Avatar Upload] Failed to create uploads directory: ${uploadsDir}`, error);
  }
} else {
  console.log(`[Avatar Upload] Uploads directory exists: ${uploadsDir}`);
}

export const avatarUploadConfig = {
  storage: diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      // التأكد من وجود المجلد قبل الحفظ
      if (!existsSync(uploadsDir)) {
        try {
          mkdirSync(uploadsDir, { recursive: true });
          console.log(`[Avatar Upload] Created uploads directory on demand: ${uploadsDir}`);
        } catch (error) {
          console.error(`[Avatar Upload] Failed to create uploads directory: ${uploadsDir}`, error);
          return cb(error as Error, '');
        }
      }
      cb(null, uploadsDir);
    },
    filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
      const fullPath = join(uploadsDir, uniqueName);
      console.log(`[Avatar Upload] Saving file: ${fullPath}`);
      cb(null, uniqueName);
    },
  }),
  fileFilter: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const fileName = file.originalname.toLowerCase();
    
    // التحقق من نوع MIME
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    
    // إذا كان نوع MIME غير محدد أو غير صحيح، التحقق من امتداد الملف
    const hasValidExtension = fileName.endsWith('.jpg') || 
                              fileName.endsWith('.jpeg') || 
                              fileName.endsWith('.png') || 
                              fileName.endsWith('.webp');
    
    if (hasValidExtension) {
      console.log(`[Avatar Upload] Accepting file with extension check: ${file.originalname}, mimetype: ${file.mimetype}`);
      cb(null, true);
      return;
    }
    
    console.log(`[Avatar Upload] Rejecting file: ${file.originalname}, mimetype: ${file.mimetype}`);
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  },
  limits: {
    fileSize: maxFileSize,
  },
};








