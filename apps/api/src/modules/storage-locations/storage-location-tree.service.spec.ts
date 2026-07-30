import { describe, expect, it } from 'vitest';

import { StorageLocationTreeService } from './storage-location-tree.service';

describe('StorageLocationTreeService', () => {
  const service = new StorageLocationTreeService();
  const nodes = [
    { id: 'zone', code: 'STO', parentId: null },
    { id: 'aisle-a', code: 'A-01', parentId: 'zone' },
    { id: 'bin-a1', code: 'BIN-01', parentId: 'aisle-a' },
  ] as const;

  it('builds a stable location path from root to leaf', () => {
    expect(service.buildPath(nodes, 'bin-a1')).toBe('STO/A-01/BIN-01');
  });

  it('calculates hierarchy depth from lineage length', () => {
    expect(service.getDepth(nodes, 'bin-a1')).toBe(2);
  });

  it('rejects circular parent assignments', () => {
    expect(() => service.assertNoCircularReference(nodes, 'zone', 'bin-a1')).toThrow(
      'Storage location cannot be assigned into its own descendant.',
    );
  });
});
