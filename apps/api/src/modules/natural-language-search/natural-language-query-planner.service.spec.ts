import { describe, expect, it } from 'vitest';

import { NaturalLanguageQueryPlannerService } from './natural-language-query-planner.service';

describe('NaturalLanguageQueryPlannerService', () => {
  const service = new NaturalLanguageQueryPlannerService();

  it('normalizes CRM pipeline queries and infers the right domain', () => {
    expect(service.planQuery('  Find overdue follow up by opportunity owner  ')).toMatchObject({
      normalizedQuery: 'find overdue follow up by opportunity owner',
      primaryDomain: 'CRM',
      modelMode: 'RULE_BASED',
    });
  });

  it('adds related finance and analytics lanes for procurement variance searches', () => {
    expect(service.planQuery('Show purchase spend variance by vendor this quarter')).toMatchObject({
      primaryDomain: 'PROCUREMENT',
      relatedDomains: ['ANALYTICS', 'FINANCE'],
      modelMode: 'HYBRID',
    });
  });

  it('rejects empty search queries', () => {
    expect(() => service.planQuery('   ')).toThrowError(/requires a query/i);
  });
});
