import { describe, expect, it, vi } from 'vitest';

import { HealthService } from './health.service';

describe('HealthService', () => {
  it('returns ready when database and redis are healthy', async () => {
    const prisma = {
      $queryRaw: vi.fn().mockResolvedValue([1]),
    };

    const redisService = {
      ping: vi.fn().mockResolvedValue(true),
    };

    const service = new HealthService(prisma as never, redisService as never);
    const result = await service.getReadiness();

    expect(result.status).toBe('ready');
    expect(result.checks.database).toBe(true);
    expect(result.checks.redis).toBe(true);
  });
});

