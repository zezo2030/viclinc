import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { json, urlencoded } from 'express';
import type { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    rawBody: false,
  });
  
  // تطبيق bodyParser يدويًا مع تخطي multipart/form-data
  app.use((req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers['content-type'] || '';
    
    // تخطي bodyParser للـ multipart/form-data - multer سيتعامل معه
    if (contentType.includes('multipart/form-data')) {
      return next();
    }
    
    // تطبيق bodyParser للـ JSON
    if (contentType.includes('application/json') || !contentType) {
      return json({ limit: '10mb' })(req, res, next);
    }
    
    // تطبيق bodyParser للـ urlencoded
    if (contentType.includes('application/x-www-form-urlencoded')) {
      return urlencoded({ extended: true, limit: '10mb' })(req, res, next);
    }
    
    // افتراضي: JSON
    return json({ limit: '10mb' })(req, res, next);
  });
  
  // CORS configuration - support for web and mobile apps
  const isDevelopment = process.env.NODE_ENV !== 'production';
  app.enableCors({
    origin: isDevelopment
      ? true // Allow all origins in development (for mobile app testing)
      : [
          'http://localhost:3001', // الويبسايت
          'http://localhost:3000', // الباك إند
          'http://localhost:3002', // لوحة الإدارة (Vite dev)
          'http://medcodesa.cloud', // الموقع الإنتاجي
          'https://medcodesa.cloud', // الموقع الإنتاجي HTTPS
        ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-role'],
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('v1');
  
  // إعداد Swagger بعد setGlobalPrefix لتضمين الـ routes بشكل صحيح
  const config = new DocumentBuilder()
    .setTitle('Clinic API')
    .setDescription('API documentation for Clinic Management')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3000', 'Development server')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Clinic API Documentation',
  });
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
