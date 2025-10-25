import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    
    this.redis = new Redis(redisUrl, {
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    });

    this.redis.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });
  }

  /**
   * الحصول على قفل Redis مع TTL
   * @param key مفتاح القفل
   * @param ttl مدة القفل بالثواني
   * @returns true إذا تم الحصول على القفل، false إذا كان محجوزاً
   */
  async acquireLock(key: string, ttl: number = 30): Promise<boolean> {
    try {
      const result = await this.redis.set(key, 'locked', 'EX', ttl, 'NX');
      return result === 'OK';
    } catch (error) {
      this.logger.error(`Failed to acquire lock for key: ${key}`, error);
      return false;
    }
  }

  /**
   * تحرير قفل Redis
   * @param key مفتاح القفل
   */
  async releaseLock(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Failed to release lock for key: ${key}`, error);
    }
  }

  /**
   * حفظ مفتاح Idempotency مع TTL
   * @param key مفتاح Idempotency
   * @param value القيمة المحفوظة
   * @param ttl مدة الصلاحية بالثواني
   */
  async setIdempotencyKey(key: string, value: string, ttl: number = 900): Promise<void> {
    try {
      await this.redis.setex(key, ttl, value);
    } catch (error) {
      this.logger.error(`Failed to set idempotency key: ${key}`, error);
    }
  }

  /**
   * استرجاع مفتاح Idempotency
   * @param key مفتاح Idempotency
   * @returns القيمة المحفوظة أو null
   */
  async getIdempotencyKey(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      this.logger.error(`Failed to get idempotency key: ${key}`, error);
      return null;
    }
  }

  /**
   * التحقق من وجود مفتاح Idempotency
   * @param key مفتاح Idempotency
   * @returns true إذا كان المفتاح موجوداً
   */
  async hasIdempotencyKey(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check idempotency key: ${key}`, error);
      return false;
    }
  }

  /**
   * حذف مفتاح Idempotency
   * @param key مفتاح Idempotency
   */
  async deleteIdempotencyKey(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete idempotency key: ${key}`, error);
    }
  }

  /**
   * إغلاق الاتصال بـ Redis
   */
  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
