import { describe, expect, it } from 'vitest';

import { navigationItems } from './navigation';

describe('navigationItems', () => {
  it('keeps unique href values for the dashboard shell', () => {
    const hrefs = navigationItems.map((item) => item.href);

    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs).toContain('/app');
    expect(hrefs).toContain('/app/bookings');
    expect(hrefs).toContain('/app/customers');
    expect(hrefs).toContain('/app/crm');
    expect(hrefs).toContain('/app/sales');
    expect(hrefs).toContain('/app/finance');
    expect(hrefs).toContain('/app/hr');
    expect(hrefs).toContain('/app/manufacturing');
    expect(hrefs).toContain('/app/ai');
    expect(hrefs).toContain('/app/automation');
    expect(hrefs).toContain('/app/integrations');
    expect(hrefs).toContain('/app/platform');
    expect(hrefs).toContain('/app/dashboards');
    expect(hrefs).toContain('/app/mobile');
    expect(hrefs).toContain('/app/products');
    expect(hrefs).toContain('/app/procurement');
    expect(hrefs).toContain('/app/inventory');
    expect(hrefs).toContain('/app/warehouse-operations');
    expect(hrefs).toContain('/app/warehouses');
    expect(hrefs).toContain('/app/roles');
  });
});
