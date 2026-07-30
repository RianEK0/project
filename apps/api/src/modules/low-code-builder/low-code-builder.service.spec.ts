import { describe, expect, it } from 'vitest';

import { LowCodeBuilderService } from './low-code-builder.service';

describe('LowCodeBuilderService', () => {
  const service = new LowCodeBuilderService();

  it('builds a low-code app preview from dropped components', () => {
    const preview = service.preview({
      appName: 'Procurement Ops Console',
      layoutMode: 'MASTER_DETAIL',
      surfaceTarget: 'DESKTOP',
      components: [
        { id: 'c1', type: 'TABLE', zone: 'Workspace', label: 'PO Table' },
        { id: 'c2', type: 'FORM', zone: 'Sidebar', label: 'Approval Form' },
        { id: 'c3', type: 'BUTTON', zone: 'Header', label: 'Create Invoice' },
        { id: 'c4', type: 'KANBAN', zone: 'Detail Panel', label: 'Approval Board' },
      ],
    });

    expect(preview.status).toBe('READY');
    expect(preview.componentCount).toBe(4);
    expect(preview.publishReadinessDate).toBe('2026-07-29');
  });

  it('rejects unsupported low-code components', () => {
    expect(() =>
      service.preview({
        appName: 'Broken App',
        components: [{ id: 'c1', type: 'UNKNOWN', zone: 'Workspace', label: 'Bad' }],
      }),
    ).toThrow();
  });
});
