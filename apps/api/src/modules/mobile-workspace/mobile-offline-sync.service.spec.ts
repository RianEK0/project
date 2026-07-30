import { describe, expect, it } from 'vitest';

import { MobileOfflineSyncService } from './mobile-offline-sync.service';

describe('MobileOfflineSyncService', () => {
  const service = new MobileOfflineSyncService();

  it('reports online when no pending operations remain', () => {
    const preview = service.previewSync({
      pendingOperations: 0,
      conflictCount: 0,
      oldestPendingMinutes: 0,
      replaySuccessRatePct: 100,
      lowBatteryModeEnabled: false,
    });

    expect(preview.status).toBe('ONLINE');
    expect(preview.syncPressure).toBe('LOW');
  });

  it('reports conflict when offline replay cannot merge safely', () => {
    const preview = service.previewSync({
      pendingOperations: 42,
      conflictCount: 3,
      oldestPendingMinutes: 18,
      replaySuccessRatePct: 88,
      lowBatteryModeEnabled: true,
    });

    expect(preview.status).toBe('CONFLICT');
    expect(preview.syncPressure).toBe('HIGH');
  });
});
