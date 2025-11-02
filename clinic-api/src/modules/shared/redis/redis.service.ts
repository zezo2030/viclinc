import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private redis: Redis | null = null;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    
    // إذا لم يكن Redis URL محدداً، تخطى التهيئة
    if (!redisUrl || redisUrl.trim() === '') {
      this.logger.warn('Redis URL not provided - Redis features will be disabled');
      return;
    }
    
    try {
      this.redis = new Redis(redisUrl, {
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
        retryStrategy: () => null, // لا تحاول إعادة الاتصال
      });

      this.redis.on('connect', () => {
        this.logger.log('Connected to Redis');
      });

      this.redis.on('error', (error) => {
        this.logger.warn('Redis connection error (Redis features disabled):', error.message);
        // تعطيل Redis عند خطأ الاتصال
        this.redis = null;
      });
    } catch (error) {
      this.logger.warn('Failed to initialize Redis (Redis features disabled):', error);
      this.redis = null;
    }
  }

  /**
   * الحصول على قفل Redis مع TTL
   * @param key مفتاح القفل
   * @param ttl مدة القفل بالثواني
   * @returns true إذا تم الحصول على القفل، false إذا كان محجوزاً
   */
  async acquireLock(key: string, ttl: number = 30): Promise<boolean> {
    if (!this.redis) {
      // إذا Redis غير متاح، نعتبر أن القفل متاح (يعمل بدون Redis)
      return true;
    }
    try {
      const result = await this.redis.set(key, 'locked', 'EX', ttl, 'NX');
      return result === 'OK';
    } catch (error) {
      this.logger.warn(`Redis lock failed for key: ${key} (continuing without Redis)`, error);
      // عند الفشل، نعتبر أن القفل متاح
      return true;
    }
  }

  /**
   * تحرير قفل Redis
   * @param key مفتاح القفل
   */
  async releaseLock(key: string): Promise<void> {
    if (!this.redis) {
      return;
    }
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.warn(`Failed to release lock for key: ${key} (Redis unavailable)`, error);
    }
  }

  /**
   * حفظ مفتاح Idempotency مع TTL
   * @param key مفتاح Idempotency
   * @param value القيمة المحفوظة
   * @param ttl مدة الصلاحية بالثواني
   */
  async setIdempotencyKey(key: string, value: string, ttl: number = 900): Promise<void> {
    if (!this.redis) {
      return; // تجاهل إذا Redis غير متاح
    }
    try {
      await this.redis.setex(key, ttl, value);
    } catch (error) {
      this.logger.warn(`Failed to set idempotency key: ${key} (Redis unavailable)`, error);
    }
  }

  /**
   * استرجاع مفتاح Idempotency
   * @param key مفتاح Idempotency
   * @returns القيمة المحفوظة أو null
   */
  async getIdempotencyKey(key: string): Promise<string | null> {
    if (!this.redis) {
      return null; // إذا Redis غير متاح، نعتبر أن المفتاح غير موجود
    }
    try {
      return await this.redis.get(key);
    } catch (error) {
      this.logger.warn(`Failed to get idempotency key: ${key} (Redis unavailable)`, error);
      return null;
    }
  }

  /**
   * التحقق من وجود مفتاح Idempotency
   * @param key مفتاح Idempotency
   * @returns true إذا كان المفتاح موجوداً
   */
  async hasIdempotencyKey(key: string): Promise<boolean> {
    if (!this.redis) {
      return false; // إذا Redis غير متاح، نعتبر أن المفتاح غير موجود
    }
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.warn(`Failed to check idempotency key: ${key} (Redis unavailable)`, error);
      return false;
    }
  }

  /**
   * حذف مفتاح Idempotency
   * @param key مفتاح Idempotency
   */
  async deleteIdempotencyKey(key: string): Promise<void> {
    if (!this.redis) {
      return;
    }
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.warn(`Failed to delete idempotency key: ${key} (Redis unavailable)`, error);
    }
  }

  /**
   * إغلاق الاتصال بـ Redis
   */
  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}
