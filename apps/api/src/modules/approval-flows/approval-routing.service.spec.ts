import { describe, expect, it } from 'vitest';

import { ApprovalRoutingService } from './approval-routing.service';

describe('ApprovalRoutingService', () => {
  const service = new ApprovalRoutingService();
  const steps = [
    { sequence: 1, approverRole: 'Department Manager', minAmount: 0, departmentScope: 'ANY' },
    { sequence: 2, approverRole: 'Finance Controller', minAmount: 50_000, departmentScope: 'ANY' },
    { sequence: 3, approverRole: 'COO', minAmount: 100_000, departmentScope: 'ANY' },
  ];

  it('routes smaller requests to the first approval step only', () => {
    expect(
      service.previewRoute({
        documentLabel: 'Purchase Request',
        amount: 25_000,
        requesterDepartment: 'OPERATIONS',
        steps,
      }),
    ).toMatchObject({
      requiredApprovers: ['Department Manager'],
      escalationRequired: false,
    });
  });

  it('escalates larger requests into deeper approval layers', () => {
    expect(
      service.previewRoute({
        documentLabel: 'Capex Request',
        amount: 150_000,
        requesterDepartment: 'OPERATIONS',
        steps,
      }),
    ).toMatchObject({
      requiredApprovers: ['Department Manager', 'Finance Controller', 'COO'],
      escalationRequired: true,
    });
  });

  it('rejects duplicate approval step sequences', () => {
    expect(() =>
      service.previewRoute({
        documentLabel: 'Budget Adjustment',
        amount: 10_000,
        requesterDepartment: 'FINANCE',
        steps: [
          { sequence: 1, approverRole: 'Manager' },
          { sequence: 1, approverRole: 'Director' },
        ],
      }),
    ).toThrowError(/unique positive sequence/i);
  });
});
