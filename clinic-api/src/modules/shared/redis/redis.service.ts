import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

// تخزين في الذاكرة كبديل لـ Redis
interface MemoryEntry {
  value: string;
  expiresAt: number;
}

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private redis: Redis | null = null;
  
  // تخزين في الذاكرة كبديل لـ Redis (للتطوير فقط)
  private memoryStore: Map<string, MemoryEntry> = new Map();
  private useMemoryFallback: boolean = false;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    
    // إذا لم يكن Redis URL محدداً، استخدم التخزين في الذاكرة
    if (!redisUrl || redisUrl.trim() === '') {
      this.logger.warn('Redis URL not provided - Using in-memory fallback (development mode only)');
      this.useMemoryFallback = true;
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
        this.logger.warn('Redis connection error (switching to memory fallback):', error.message);
        // التبديل إلى التخزين في الذاكرة عند خطأ الاتصال
        this.redis = null;
        this.useMemoryFallback = true;
      });
    } catch (error) {
      this.logger.warn('Failed to initialize Redis (using memory fallback):', error);
      this.redis = null;
      this.useMemoryFallback = true;
    }
  }
  
  // تنظيف القيم المنتهية الصلاحية من التخزين في الذاكرة
  private cleanupExpiredMemoryEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryStore.entries()) {
      if (entry.expiresAt <= now) {
        this.memoryStore.delete(key);
      }
    }
  }

  /**
   * الحصول على قفل Redis مع TTL
   * @param key مفتاح القفل
   * @param ttl مدة القفل بالثواني
   * @returns true إذا تم الحصول على القفل، false إذا كان محجوزاً
   */
  async acquireLock(key: string, ttl: number = 30): Promise<boolean> {
    // استخدام التخزين في الذاكرة كبديل
    if (this.useMemoryFallback && !this.redis) {
      this.cleanupExpiredMemoryEntries();
      const existing = this.memoryStore.get(key);
      if (existing && existing.expiresAt > Date.now()) {
        return false; // القفل محجوز
      }
      this.memoryStore.set(key, {
        value: 'locked',
        expiresAt: Date.now() + ttl * 1000,
      });
      return true;
    }
    
    if (!this.redis) {
      // إذا Redis غير متاح ولا يوجد fallback، نعتبر أن القفل متاح
      return true;
    }
    try {
      const result = await this.redis.set(key, 'locked', 'EX', ttl, 'NX');
      return result === 'OK';
    } catch (error) {
      this.logger.warn(`Redis lock failed for key: ${key} (continuing without Redis)`, error);
      return true;
    }
  }

  /**
   * تحرير قفل Redis
   * @param key مفتاح القفل
   */
  async releaseLock(key: string): Promise<void> {
    // استخدام التخزين في الذاكرة كبديل
    if (this.useMemoryFallback && !this.redis) {
      this.memoryStore.delete(key);
      return;
    }
    
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
    // استخدام التخزين في الذاكرة كبديل
    if (this.useMemoryFallback && !this.redis) {
      this.memoryStore.set(key, {
        value,
        expiresAt: Date.now() + ttl * 1000,
      });
      this.logger.debug(`[Memory] Set key: ${key}, TTL: ${ttl}s`);
      return;
    }
    
    if (!this.redis) {
      return;
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
    // استخدام التخزين في الذاكرة كبديل
    if (this.useMemoryFallback && !this.redis) {
      this.cleanupExpiredMemoryEntries();
      const entry = this.memoryStore.get(key);
      if (entry && entry.expiresAt > Date.now()) {
        this.logger.debug(`[Memory] Get key: ${key} - FOUND`);
        return entry.value;
      }
      this.logger.debug(`[Memory] Get key: ${key} - NOT FOUND`);
      return null;
    }
    
    if (!this.redis) {
      return null;
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
    // استخدام التخزين في الذاكرة كبديل
    if (this.useMemoryFallback && !this.redis) {
      this.cleanupExpiredMemoryEntries();
      const entry = this.memoryStore.get(key);
      return !!(entry && entry.expiresAt > Date.now());
    }
    
    if (!this.redis) {
      return false;
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
    // استخدام التخزين في الذاكرة كبديل
    if (this.useMemoryFallback && !this.redis) {
      this.memoryStore.delete(key);
      return;
    }
    
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
    // تنظيف التخزين في الذاكرة
    this.memoryStore.clear();
  }
}
