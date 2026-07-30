import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: IORedis | null;

  constructor(@Inject(ConfigService) configService: ConfigService) {
    const url = configService?.get<string>('REDIS_URL');
    this.client = url
      ? new IORedis(url, {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
        })
      : null;
  }

  async ping(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      if (this.client.status === 'wait') {
        await this.client.connect();
      }

      return (await this.client.ping()) === 'PONG';
    } catch {
      return false;
    }
  }

  getClient(): IORedis | null {
    return this.client;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }
}
