import { describe, expect, it } from 'vitest';

import { portalNavigationItems } from './portal-navigation';

describe('portalNavigationItems', () => {
  it('keeps unique href values for the customer portal shell', () => {
    const hrefs = portalNavigationItems.map((item) => item.href);

    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs).toContain('/portal');
    expect(hrefs).toContain('/portal/bookings');
    expect(hrefs).toContain('/portal/orders');
    expect(hrefs).toContain('/portal/invoices');
    expect(hrefs).toContain('/portal/tickets');
    expect(hrefs).toContain('/portal/support');
    expect(hrefs).toContain('/portal/downloads');
    expect(hrefs).toContain('/portal/payments');
    expect(hrefs).toContain('/portal/profile');
    expect(hrefs).toContain('/portal/notifications');
    expect(hrefs).toContain('/portal/tracking');
  });
});
