import { describe, expect, it } from 'vitest';

import { DashboardBuilderService } from './dashboard-builder.service';

describe('DashboardBuilderService', () => {
  const service = new DashboardBuilderService();

  it('builds a self-serve dashboard preview from widgets', () => {
    const preview = service.preview({
      dashboardName: 'Operations Pulse',
      audience: 'WAREHOUSE',
      layoutMode: 'OPS_WALL',
      refreshCadence: 'LIVE',
      widgets: [
        { id: 'w1', type: 'METRIC', slot: 'Hero', title: 'On-Time Dispatch' },
        { id: 'w2', type: 'KANBAN', slot: 'Mid Row', title: 'Open Tasks' },
        { id: 'w3', type: 'CALENDAR', slot: 'Bottom Row', title: 'Dock Calendar' },
      ],
    });

    expect(preview.status).toBe('READY');
    expect(preview.widgetCount).toBe(3);
    expect(preview.nextPublishDate).toBe('2026-07-28');
  });

  it('rejects unsupported dashboard widget types', () => {
    expect(() =>
      service.preview({
        dashboardName: 'Broken Board',
        widgets: [{ id: 'w1', type: 'UNKNOWN', slot: 'Hero', title: 'Nope' }],
      }),
    ).toThrow();
  });
});
