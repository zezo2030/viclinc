import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { RedisService } from './modules/shared/redis/redis.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHealth() {
    return { status: 'ok' };
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health check including database and Redis' })
  @ApiResponse({ status: 200, description: 'Detailed health status' })
  async getDetailedHealth() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        api: { status: 'up' },
        database: await this.checkDatabase(),
        redis: await this.checkRedis(),
      },
    };

    const allUp = Object.values(health.services).every(
      (service: any) => service.status === 'up' || service.status === 'connected',
    );

    return {
      ...health,
      status: allUp ? 'ok' : 'degraded',
    };
  }

  private async checkDatabase() {
    try {
      const state = this.connection.readyState;
      if (state === 1) {
        // 1 = connected
        return { status: 'connected', message: 'MongoDB is connected' };
      } else {
        return { status: 'disconnected', message: `MongoDB state: ${state}` };
      }
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  private async checkRedis() {
    try {
      // Try to get a test key from Redis
      const testKey = `health-check-${Date.now()}`;
      await this.redisService.acquireLock(testKey, 1);
      await this.redisService.releaseLock(testKey);
      return { status: 'connected', message: 'Redis is connected' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}


