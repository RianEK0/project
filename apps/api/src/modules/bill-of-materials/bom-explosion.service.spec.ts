import { describe, expect, it } from 'vitest';

import { BomExplosionService } from './bom-explosion.service';

describe('BomExplosionService', () => {
  const service = new BomExplosionService();

  it('explodes nested subassemblies into multiplied component quantities', () => {
    expect(
      service.summarizeExplosion(
        [
          {
            componentCode: 'FRAME-KIT',
            quantityPer: 2,
            lineType: 'SUBASSEMBLY',
            children: [
              { componentCode: 'STEEL-PLATE', quantityPer: 3, lineType: 'COMPONENT' },
              { componentCode: 'BOLT-M8', quantityPer: 8, lineType: 'COMPONENT' },
            ],
          },
        ],
        5,
      ),
    ).toEqual([
      { componentCode: 'STEEL-PLATE', lineType: 'COMPONENT', totalQuantity: 30 },
      { componentCode: 'BOLT-M8', lineType: 'COMPONENT', totalQuantity: 80 },
    ]);
  });

  it('aggregates duplicate leaf components from multiple BOM branches', () => {
    expect(
      service.summarizeExplosion(
        [
          { componentCode: 'BOLT-M8', quantityPer: 4, lineType: 'COMPONENT' },
          {
            componentCode: 'PANEL-SET',
            quantityPer: 1,
            lineType: 'SUBASSEMBLY',
            children: [{ componentCode: 'BOLT-M8', quantityPer: 6, lineType: 'COMPONENT' }],
          },
        ],
        2,
      ),
    ).toEqual([{ componentCode: 'BOLT-M8', lineType: 'COMPONENT', totalQuantity: 20 }]);
  });

  it('rejects circular BOM structures', () => {
    expect(() =>
      service.summarizeExplosion(
        [
          {
            componentCode: 'ASSEMBLY-A',
            quantityPer: 1,
            lineType: 'SUBASSEMBLY',
            children: [
              {
                componentCode: 'ASSEMBLY-A',
                quantityPer: 1,
                lineType: 'SUBASSEMBLY',
              },
            ],
          },
        ],
        1,
      ),
    ).toThrowError(/circular bom reference/i);
  });
});
