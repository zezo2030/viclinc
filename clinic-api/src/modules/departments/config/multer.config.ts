import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync } from 'fs';
import type { Request } from 'express';

const maxFileSize = parseInt(process.env.MAX_LOGO_SIZE_MB || '2') * 1024 * 1024;
const uploadsDir = join(process.cwd(), 'uploads', 'sections', 'logos');

// إنشاء المجلد إذا لم يكن موجوداً
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

export const multerConfig = {
  storage: diskStorage({
    destination: uploadsDir,
    filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
    }
  },
  limits: {
    fileSize: maxFileSize,
  },
};

