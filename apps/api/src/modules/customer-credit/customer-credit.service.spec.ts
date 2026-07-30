import { describe, expect, it } from 'vitest';

import { CustomerCreditService } from './customer-credit.service';

describe('CustomerCreditService', () => {
  const service = new CustomerCreditService();

  it('summarizes exposure and available credit for a healthy customer', () => {
    const summary = service.summarize({
      creditLimit: 1000,
      openOrderAmount: 200,
      openInvoiceAmount: 500,
      pendingPaymentAmount: 100,
      requestedOrderAmount: 150,
    });

    expect(summary.totalExposure).toBe(600);
    expect(summary.availableCredit).toBe(400);
    expect(summary.riskLevel).toBe('AVAILABLE');
    expect(summary.canApproveRequestedOrder).toBe(true);
  });

  it('puts customers on hold when overdue or heavily utilized', () => {
    const summary = service.summarize({
      creditLimit: 1000,
      openOrderAmount: 200,
      openInvoiceAmount: 700,
      overdueAmount: 100,
      requestedOrderAmount: 100,
    });

    expect(summary.riskLevel).toBe('ON_HOLD');
    expect(summary.canApproveRequestedOrder).toBe(false);
  });

  it('blocks customers whose exposure exceeds the limit', () => {
    const summary = service.summarize({
      creditLimit: 1000,
      openOrderAmount: 400,
      openInvoiceAmount: 700,
      requestedOrderAmount: 50,
    });

    expect(summary.riskLevel).toBe('BLOCKED');
    expect(summary.availableCredit).toBe(0);
  });
});
