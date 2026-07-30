import { describe, expect, it } from 'vitest';

import { ReportBuilderService } from './report-builder.service';

describe('ReportBuilderService', () => {
  const service = new ReportBuilderService();

  it('builds a report preview from query stages', () => {
    const preview = service.preview({
      reportName: 'Purchase Aging Watch',
      dataset: 'Purchase Orders',
      joinType: 'LEFT',
      blocks: [
        { id: 'b1', type: 'SELECT' },
        { id: 'b2', type: 'FILTER' },
        { id: 'b3', type: 'GROUP' },
        { id: 'b4', type: 'EXPORT' },
      ],
    });

    expect(preview.status).toBe('READY');
    expect(preview.sqlPreview).toContain('FROM purchase_orders');
    expect(preview.recommendedScheduleDate).toBe('2026-07-27');
  });

  it('rejects report previews without a leading select stage', () => {
    expect(() =>
      service.preview({
        reportName: 'Broken Report',
        dataset: 'Invoices',
        blocks: [{ id: 'b1', type: 'FILTER' }],
      }),
    ).toThrow();
  });
});
