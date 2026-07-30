import { describe, expect, it } from 'vitest';

import { MrpNetRequirementService } from './mrp-net-requirement.service';

describe('MrpNetRequirementService', () => {
  const service = new MrpNetRequirementService();

  it('rounds shortage requirements up to the planning lot size', () => {
    expect(
      service.previewRequirement({
        itemCode: 'MOTOR-220V',
        grossRequirement: 180,
        onHand: 40,
        scheduledReceipts: 20,
        safetyStock: 10,
        lotSize: 50,
      }),
    ).toMatchObject({
      status: 'EXCEPTION',
      exceptionType: 'SHORTAGE',
      netRequirement: 130,
      plannedOrderReceipt: 150,
    });
  });

  it('marks plans as completed when supply already covers demand', () => {
    expect(
      service.previewRequirement({
        itemCode: 'SENSOR-A',
        grossRequirement: 60,
        onHand: 90,
        scheduledReceipts: 20,
        safetyStock: 10,
        lotSize: 25,
      }),
    ).toMatchObject({
      status: 'COMPLETED',
      netRequirement: 0,
      plannedOrderReceipt: 0,
    });
  });

  it('blocks overlapping MRP runs for the same bucket', () => {
    expect(() => service.assertRunnable('RUNNING')).toThrowError(/already in progress/i);
  });
});
