import { describe, expect, it } from 'vitest';

import { WarehouseScanResolutionService } from './warehouse-scan-resolution.service';

describe('WarehouseScanResolutionService', () => {
  const service = new WarehouseScanResolutionService();

  it('resolves prefixed operational codes', () => {
    expect(service.resolve('loc:BIN-A-01')).toEqual({
      scanType: 'STORAGE_LOCATION',
      entityType: 'storageLocation',
      value: 'BIN-A-01',
      normalizedCode: 'LOC:BIN-A-01',
    });
  });

  it('treats numeric codes as barcodes', () => {
    expect(service.resolve('8998887776665')).toEqual({
      scanType: 'BARCODE',
      entityType: 'productBarcode',
      value: '8998887776665',
      normalizedCode: '8998887776665',
    });
  });

  it('rejects unknown scan formats', () => {
    expect(() => service.resolve('mystery-code')).toThrowError(/not recognized/i);
  });
});
