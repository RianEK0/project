import { HttpStatus, Injectable } from '@nestjs/common';
import {
  aiModelModes,
  aiRequestStatuses,
  aiSearchDomains,
  type AiModelMode,
  type AiRequestStatus,
  type AiSearchDomain,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

export type NaturalLanguageQueryPlan = {
  query: string;
  normalizedQuery: string;
  primaryDomain: AiSearchDomain;
  relatedDomains: AiSearchDomain[];
  modelMode: AiModelMode;
  filters: string[];
  executionPlan: string[];
};

@Injectable()
export class NaturalLanguageQueryPlannerService {
  getStatuses(): AiRequestStatus[] {
    return [...aiRequestStatuses];
  }

  getDomains(): AiSearchDomain[] {
    return [...aiSearchDomains];
  }

  getModelModes(): AiModelMode[] {
    return [...aiModelModes];
  }

  planQuery(query: string): NaturalLanguageQueryPlan {
    const normalizedQuery = query.replace(/\s+/g, ' ').trim();

    if (!normalizedQuery) {
      throw new AppException(
        ERROR_CODES.AI_SEARCH_QUERY_EMPTY,
        'Natural-language search requires a query.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const primaryDomain = this.inferPrimaryDomain(normalizedQuery);
    const relatedDomains = this.inferRelatedDomains(normalizedQuery, primaryDomain);

    return {
      query: normalizedQuery,
      normalizedQuery: normalizedQuery.toLowerCase(),
      primaryDomain,
      relatedDomains,
      modelMode: relatedDomains.length > 0 ? 'HYBRID' : 'RULE_BASED',
      filters: this.extractFilters(normalizedQuery),
      executionPlan: [
        'Normalize the prompt into searchable entities, time windows, and grain.',
        `Query the ${primaryDomain.toLowerCase()} bounded context first.`,
        ...(relatedDomains.length > 0
          ? [
              `Merge supporting signals from ${relatedDomains.map((domain) => domain.toLowerCase()).join(', ')}.`,
            ]
          : []),
        'Return ranked results with related route suggestions.',
      ],
    };
  }

  private inferPrimaryDomain(query: string): AiSearchDomain {
    const normalizedQuery = query.toLowerCase();

    if (/(lead|opportunity|deal|follow up|meeting|crm|pipeline)/.test(normalizedQuery)) {
      return 'CRM';
    }

    if (/(rfq|vendor|supplier|purchase|procurement)/.test(normalizedQuery)) {
      return 'PROCUREMENT';
    }

    if (/(inventory|stock|warehouse|lot|serial|sku)/.test(normalizedQuery)) {
      return 'INVENTORY';
    }

    if (/(journal|ledger|accounting|balance sheet|profit|loss)/.test(normalizedQuery)) {
      return 'ACCOUNTING';
    }

    if (/(bank|cash|budget|finance|exchange rate)/.test(normalizedQuery)) {
      return 'FINANCE';
    }

    if (/(employee|attendance|leave|payroll|recruitment|training|kpi)/.test(normalizedQuery)) {
      return 'HR';
    }

    if (/(bom|mrp|production|work order|quality|machine|capacity)/.test(normalizedQuery)) {
      return 'MANUFACTURING';
    }

    if (
      /(sales|quotation|sales order|shipment|return|credit note|discount)/.test(normalizedQuery)
    ) {
      return 'SALES';
    }

    if (/(analytics|trend|dashboard|compare|summary)/.test(normalizedQuery)) {
      return 'ANALYTICS';
    }

    return 'ERP';
  }

  private inferRelatedDomains(query: string, primaryDomain: AiSearchDomain): AiSearchDomain[] {
    const relatedDomains = new Set<AiSearchDomain>();
    const normalizedQuery = query.toLowerCase();

    if (/(report|summary|trend|compare|variance|dashboard)/.test(normalizedQuery)) {
      relatedDomains.add('ANALYTICS');
    }

    if (primaryDomain === 'PROCUREMENT' && /(cost|spend|budget|invoice)/.test(normalizedQuery)) {
      relatedDomains.add('FINANCE');
    }

    if (primaryDomain === 'CRM' && /(quotation|sales order|invoice)/.test(normalizedQuery)) {
      relatedDomains.add('SALES');
    }

    if (
      primaryDomain === 'MANUFACTURING' &&
      /(stock|component|warehouse|material)/.test(normalizedQuery)
    ) {
      relatedDomains.add('INVENTORY');
    }

    if (primaryDomain === 'ERP') {
      relatedDomains.add('ANALYTICS');
    }

    relatedDomains.delete(primaryDomain);

    return [...relatedDomains];
  }

  private extractFilters(query: string): string[] {
    const filters: string[] = [];
    const normalizedQuery = query.toLowerCase();

    if (/(today|this week|this month|this quarter)/.test(normalizedQuery)) {
      filters.push('time-window');
    }

    if (/(warehouse|location|branch|department|cost center)/.test(normalizedQuery)) {
      filters.push('organizational-scope');
    }

    if (/(customer|vendor|supplier|employee)/.test(normalizedQuery)) {
      filters.push('party-entity');
    }

    if (/(status|blocked|overdue|backorder|exception)/.test(normalizedQuery)) {
      filters.push('operational-status');
    }

    return filters;
  }
}
