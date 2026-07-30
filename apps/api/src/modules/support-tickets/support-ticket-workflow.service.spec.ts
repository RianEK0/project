import { describe, expect, it } from 'vitest';

import { SupportTicketWorkflowService } from './support-ticket-workflow.service';

describe('SupportTicketWorkflowService', () => {
  const service = new SupportTicketWorkflowService();

  it('allows triage and resolution progression for open tickets', () => {
    expect(service.canTransition('OPEN', 'ACKNOWLEDGED')).toBe(true);
    expect(service.canTransition('ACKNOWLEDGED', 'IN_PROGRESS')).toBe(true);
    expect(service.canCustomerReply('WAITING_FOR_CUSTOMER')).toBe(true);
  });

  it('rejects invalid support ticket transitions', () => {
    expect(() => service.assertTransition('CLOSED', 'IN_PROGRESS')).toThrowError(
      /transition from closed to in_progress is not allowed/i,
    );
  });

  it('only allows closing a resolved ticket', () => {
    expect(() => service.assertClosable('IN_PROGRESS')).toThrowError(/cannot be closed yet/i);
    expect(service.getClosableStatuses()).toContain('RESOLVED');
  });
});
