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
  const isProduction = process.env.NODE_ENV === 'production';
  const isLocalhost = process.env.NODE_ENV === undefined || 
                      process.env.NODE_ENV === 'development' || 
                      !process.env.NODE_ENV ||
                      (!isProduction && process.env.PORT === '3000');

  // Define allowed origins - be more permissive for localhost
  const allowedOrigins = new Set<string>([
    // Always allow localhost origins (for development)
    'http://localhost',
    'http://localhost:80',
    'http://localhost:3000',
    'http://localhost:3001', // الويبسايت
    'http://localhost:3002', // لوحة الإدارة (Vite dev)
    'http://127.0.0.1',
    'http://127.0.0.1:80',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://medcodesa.cloud',
    'https://medcodesa.cloud',
  ]);

  if (isProduction) {
    const productionDefaults = [
      'http://medcodesa.cloud',
      'https://medcodesa.cloud',
    ];

    const envOrigins = (process.env.ALLOWED_ORIGINS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    [...productionDefaults, ...envOrigins].forEach((origin) => allowedOrigins.add(origin));
  }

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Always allow requests with no origin (like mobile apps or Postman)
      if (!origin) {
        // Only log in development mode to reduce production log noise
        if (process.env.NODE_ENV !== 'production') {
          console.log('[CORS] Allowing request with no origin');
        }
        return callback(null, true);
      }
      
      console.log(`[CORS] Checking origin: ${origin}, NODE_ENV: ${process.env.NODE_ENV}, isLocalhost: ${isLocalhost}, isProduction: ${isProduction}`);
      
      // Check if origin is in allowed list
      if (allowedOrigins.has(origin)) {
        console.log(`[CORS] Allowing origin: ${origin}`);
        return callback(null, true);
      }
      
      // Always allow any localhost origin (for development flexibility)
      if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        console.log(`[CORS] Allowing localhost origin: ${origin}`);
        return callback(null, true);
      }
      
      // Reject other origins
      console.log(`[CORS] Rejecting origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-role', 'X-Requested-With'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
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
