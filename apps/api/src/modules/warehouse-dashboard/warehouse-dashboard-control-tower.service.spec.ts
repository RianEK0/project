import { describe, expect, it } from 'vitest';

import { WarehouseDashboardControlTowerService } from './warehouse-dashboard-control-tower.service';

describe('WarehouseDashboardControlTowerService', () => {
  const service = new WarehouseDashboardControlTowerService();

  it('keeps the control tower healthy when task pressure is light', () => {
    const tower = service.previewTower({
      openTasks: 14,
      overdueTasks: 0,
      dispatchReady: 16,
      receiptBacklog: 5,
      pickingAccuracyPct: 98.4,
    });

    expect(tower.overallSignal).toBe('HEALTHY');
    expect(tower.flowPressure).toBe('MEDIUM');
  });

  it('raises a critical alert when overdue pressure spikes', () => {
    const tower = service.previewTower({
      openTasks: 24,
      overdueTasks: 8,
      dispatchReady: 6,
      receiptBacklog: 18,
      pickingAccuracyPct: 95.5,
    });

    expect(tower.overallSignal).toBe('CRITICAL');
    expect(tower.focusArea).toBe('Task overdue pressure');
  });
});
