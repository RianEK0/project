import { describe, expect, it } from 'vitest';

import { InventoryDashboardHealthService } from './inventory-dashboard-health.service';

describe('InventoryDashboardHealthService', () => {
  const service = new InventoryDashboardHealthService();

  it('keeps a clean inventory portfolio healthy', () => {
    const health = service.previewHealth({
      onHandValue: 4_000_000,
      blockedValue: 120_000,
      agingStockValue: 180_000,
      reorderAlerts: 4,
      stockAccuracyPct: 98.1,
    });

    expect(health.overallSignal).toBe('HEALTHY');
    expect(health.focusArea).toBe('Inventory health baseline');
  });

  it('raises a critical signal when blocked and aging stock spike', () => {
    const health = service.previewHealth({
      onHandValue: 1_000_000,
      blockedValue: 240_000,
      agingStockValue: 260_000,
      reorderAlerts: 14,
      stockAccuracyPct: 95,
    });

    expect(health.overallSignal).toBe('CRITICAL');
    expect(health.focusArea).toBe('Blocked stock');
  });
});
