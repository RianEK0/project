import { describe, expect, it } from 'vitest';

import { ManufacturingDashboardThroughputService } from './manufacturing-dashboard-throughput.service';

describe('ManufacturingDashboardThroughputService', () => {
  const service = new ManufacturingDashboardThroughputService();

  it('keeps throughput healthy when load and yield are balanced', () => {
    const throughput = service.previewThroughput({
      workCenter: 'WC-ASSY-01',
      availableHours: 80,
      plannedHours: 68,
      overtimeBufferHours: 8,
      firstPassYieldPct: 97.4,
      shortageOrders: 2,
    });

    expect(throughput.overallSignal).toBe('HEALTHY');
    expect(throughput.focusArea).toBe('Manufacturing throughput baseline');
  });

  it('escalates overloaded and shortage-heavy work centers', () => {
    const throughput = service.previewThroughput({
      workCenter: 'WC-ASSY-02',
      availableHours: 72,
      plannedHours: 84,
      overtimeBufferHours: 4,
      firstPassYieldPct: 93.2,
      shortageOrders: 9,
    });

    expect(throughput.overallSignal).toBe('CRITICAL');
    expect(throughput.focusArea).toBe('Capacity utilization');
  });
});
