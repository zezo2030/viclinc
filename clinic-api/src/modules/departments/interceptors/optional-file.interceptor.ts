import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { multerConfig } from '../config/multer.config';
import multer from 'multer';

@Injectable()
export class OptionalFileInterceptor implements NestInterceptor {
  private upload = multer(multerConfig).single('logo');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const contentType = request.headers['content-type'] || '';

    // إذا كان multipart/form-data، استخدم multer لمعالجة الملف
    if (contentType.includes('multipart/form-data')) {
      return new Observable((observer) => {
        this.upload(request, response, (err: any) => {
          if (err) {
            observer.error(err);
            return;
          }
          // الملف الآن في request.file
          next.handle().subscribe({
            next: (value) => observer.next(value),
            error: (error) => observer.error(error),
            complete: () => observer.complete(),
          });
        });
      });
    }

    // إذا لم يكن multipart، استمر بدون معالجة ملف
    return next.handle();
  }
}

