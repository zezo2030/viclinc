import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../config/multer.config';

@Injectable()
export class ConditionalFileInterceptor implements NestInterceptor {
  private fileInterceptor = FileInterceptor('logo', multerConfig);

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const contentType = request.headers['content-type'] || '';

    // إذا كان multipart/form-data، استخدم FileInterceptor
    if (contentType.includes('multipart/form-data')) {
      return new Promise((resolve, reject) => {
        const interceptor = this.fileInterceptor as any;
        interceptor.intercept(context, {
          ...next,
          handle: () => {
            return next.handle();
          },
        } as any).subscribe({
          next: (value: any) => resolve(value),
          error: (err: any) => reject(err),
        });
      }) as any;
    }

    // إذا لم يكن multipart، استمر بدون interceptor
    return next.handle();
  }
}



