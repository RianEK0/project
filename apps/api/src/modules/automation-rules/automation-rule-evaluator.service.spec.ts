import { describe, expect, it } from 'vitest';

import { AutomationRuleEvaluatorService } from './automation-rule-evaluator.service';

describe('AutomationRuleEvaluatorService', () => {
  const service = new AutomationRuleEvaluatorService();

  it('queues actions when all rule conditions match the context', () => {
    expect(
      service.evaluateRule({
        ruleName: 'High-value approval alert',
        conditions: [
          { field: 'status', operator: 'EQUALS', value: 'PENDING_APPROVAL' },
          { field: 'amount', operator: 'GREATER_THAN', value: 100_000 },
        ],
        actions: [
          { actionType: 'SEND_SLACK', target: '#approvals' },
          { actionType: 'SEND_EMAIL', target: 'finance@novaerp.local' },
        ],
        context: {
          status: 'PENDING_APPROVAL',
          amount: 125_000,
        },
      }),
    ).toMatchObject({
      shouldRun: true,
      matchedConditions: 2,
      queuedActions: ['SEND_SLACK -> #approvals', 'SEND_EMAIL -> finance@novaerp.local'],
    });
  });

  it('returns no queued actions when one condition fails', () => {
    expect(
      service.evaluateRule({
        ruleName: 'Overdue reminder',
        conditions: [
          { field: 'status', operator: 'EQUALS', value: 'OVERDUE' },
          { field: 'channel', operator: 'EQUALS', value: 'EMAIL' },
        ],
        actions: [{ actionType: 'SEND_EMAIL', target: 'owner@novaerp.local' }],
        context: {
          status: 'DRAFT',
          channel: 'EMAIL',
        },
      }),
    ).toMatchObject({
      shouldRun: false,
      matchedConditions: 1,
      queuedActions: [],
    });
  });

  it('rejects rules without conditions', () => {
    expect(() =>
      service.evaluateRule({
        ruleName: 'Broken rule',
        conditions: [],
        actions: [{ actionType: 'SEND_EMAIL', target: 'ops@novaerp.local' }],
        context: {},
      }),
    ).toThrowError(/at least one condition/i);
  });
});
