import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';
import { RedisService } from '@/modules/redis/redis.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  getLiveness() {
    return {
      status: 'ok',
      service: 'novaerp-api',
      timestamp: new Date().toISOString(),
    };
  }

  async getReadiness() {
    const [database, redis] = await Promise.all([
      this.pingDatabase(),
      this.redisService.ping(),
    ]);

    return {
      status: database && redis ? 'ready' : 'degraded',
      checks: {
        database,
        redis,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getHealth() {
    return {
      ...(await this.getReadiness()),
      service: 'novaerp-api',
      version: '0.1.0',
    };
  }

  private async pingDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}

