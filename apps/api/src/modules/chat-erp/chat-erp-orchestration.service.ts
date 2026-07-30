import { HttpStatus, Injectable } from '@nestjs/common';
import {
  aiConversationRoles,
  aiInsightTypes,
  aiRequestStatuses,
  aiSearchDomains,
  type AiConversationRole,
  type AiInsightType,
  type AiModelMode,
  type AiRequestStatus,
  type AiSearchDomain,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type ChatRouteInput = {
  prompt: string;
  preferredDomain?: string;
};

export type ChatRoutePreview = {
  prompt: string;
  domain: AiSearchDomain;
  insightType: AiInsightType;
  modelMode: AiModelMode;
  requestStatus: AiRequestStatus;
  intent: string;
  rationale: string;
  nextActions: string[];
};

@Injectable()
export class ChatErpOrchestrationService {
  getStatuses(): AiRequestStatus[] {
    return [...aiRequestStatuses];
  }

  getConversationRoles(): AiConversationRole[] {
    return [...aiConversationRoles];
  }

  getInsightTypes(): AiInsightType[] {
    return [...aiInsightTypes];
  }

  getSupportedDomains(): AiSearchDomain[] {
    return [...aiSearchDomains];
  }

  previewRoute(input: ChatRouteInput): ChatRoutePreview {
    const prompt = input.prompt.trim();

    if (!prompt) {
      throw new AppException(
        ERROR_CODES.AI_SEARCH_QUERY_EMPTY,
        'AI orchestration requires a non-empty prompt.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const domain = input.preferredDomain
      ? this.resolvePreferredDomain(input.preferredDomain)
      : this.inferDomain(prompt);
    const insightType = this.inferInsightType(prompt);
    const modelMode = this.inferModelMode(prompt, domain, insightType);

    return {
      prompt,
      domain,
      insightType,
      modelMode,
      requestStatus: 'COMPLETED',
      intent: this.describeIntent(domain, insightType),
      rationale: this.describeRationale(prompt, domain, insightType),
      nextActions: this.buildNextActions(domain, insightType),
    };
  }

  private resolvePreferredDomain(domain: string): AiSearchDomain {
    const normalizedDomain = domain.trim().toUpperCase();

    if (!aiSearchDomains.includes(normalizedDomain as AiSearchDomain)) {
      throw new AppException(
        ERROR_CODES.AI_CHAT_ROUTE_NOT_FOUND,
        `No AI route is configured for preferred domain "${domain}".`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return normalizedDomain as AiSearchDomain;
  }

  private inferDomain(prompt: string): AiSearchDomain {
    const normalizedPrompt = prompt.toLowerCase();

    if (/(stock|inventory|warehouse|lot|serial|sku|putaway|pick)/.test(normalizedPrompt)) {
      return 'INVENTORY';
    }

    if (/(rfq|vendor|supplier|purchase|procurement|lead time|quotation)/.test(normalizedPrompt)) {
      return 'PROCUREMENT';
    }

    if (/(lead|opportunity|deal|pipeline|follow up|crm|customer timeline)/.test(normalizedPrompt)) {
      return 'CRM';
    }

    if (
      /(sales|sales order|delivery|shipment|invoice|discount|price list)/.test(normalizedPrompt)
    ) {
      return 'SALES';
    }

    if (/(journal|ledger|cash flow|balance sheet|profit|loss|accounting)/.test(normalizedPrompt)) {
      return 'ACCOUNTING';
    }

    if (/(budget|treasury|bank|cash|exchange rate|finance)/.test(normalizedPrompt)) {
      return 'FINANCE';
    }

    if (/(attendance|leave|payroll|employee|recruitment|kpi|training)/.test(normalizedPrompt)) {
      return 'HR';
    }

    if (/(bom|mrp|production|work order|machine|quality|capacity)/.test(normalizedPrompt)) {
      return 'MANUFACTURING';
    }

    if (/(dashboard|trend|anomaly|analytics|compare|comparison|report)/.test(normalizedPrompt)) {
      return 'ANALYTICS';
    }

    return 'ERP';
  }

  private inferInsightType(prompt: string): AiInsightType {
    const normalizedPrompt = prompt.toLowerCase();

    if (/(forecast|projection|next month|next quarter|trend)/.test(normalizedPrompt)) {
      return 'FORECAST';
    }

    if (/(recommend|should|suggest|priority|action)/.test(normalizedPrompt)) {
      return 'RECOMMENDATION';
    }

    if (/(report|summary|brief|digest|recap)/.test(normalizedPrompt)) {
      return 'REPORT';
    }

    if (/(find|search|show|list|where|which)/.test(normalizedPrompt)) {
      return 'SEARCH';
    }

    return 'ANSWER';
  }

  private inferModelMode(
    prompt: string,
    domain: AiSearchDomain,
    insightType: AiInsightType,
  ): AiModelMode {
    if (insightType === 'FORECAST' || insightType === 'RECOMMENDATION') {
      return 'HYBRID';
    }

    if (insightType === 'REPORT') {
      return 'LLM_ASSISTED';
    }

    if (domain === 'ERP' || /(compare|across|overall|executive)/i.test(prompt)) {
      return 'HYBRID';
    }

    return 'RULE_BASED';
  }

  private describeIntent(domain: AiSearchDomain, insightType: AiInsightType): string {
    const insightLabelMap: Record<AiInsightType, string> = {
      ANSWER: 'penjelasan',
      SUMMARY: 'ringkasan',
      SEARCH: 'pencarian',
      REPORT: 'ringkasan',
      FORECAST: 'proyeksi',
      RECOMMENDATION: 'rekomendasi',
      ANOMALY: 'anomali',
    };

    const domainLabelMap: Record<AiSearchDomain, string> = {
      ERP: 'ERP umum',
      INVENTORY: 'inventory',
      PROCUREMENT: 'procurement',
      CRM: 'CRM',
      SALES: 'sales',
      ACCOUNTING: 'accounting',
      FINANCE: 'finance',
      HR: 'HR',
      MANUFACTURING: 'manufacturing',
      ANALYTICS: 'analytics',
    };

    return `${insightLabelMap[insightType]} untuk konteks ${domainLabelMap[domain]}`;
  }

  private describeRationale(
    prompt: string,
    domain: AiSearchDomain,
    insightType: AiInsightType,
  ): string {
    const domainLabel = domain.toLowerCase();
    const insightLabel = insightType.toLowerCase();

    return `AI membaca pertanyaan "${prompt}" sebagai kebutuhan ${insightLabel} pada area ${domainLabel}. Routing ini dipilih karena kata kunci dan konteks pertanyaannya paling dekat dengan workflow ${domainLabel}, sehingga jawaban bisa lebih relevan dan langkah lanjutnya lebih jelas.`;
  }

  private buildNextActions(domain: AiSearchDomain, insightType: AiInsightType): string[] {
    const firstStep =
      insightType === 'SEARCH'
        ? 'Ubah pertanyaan menjadi entity, filter, dan kata kunci yang bisa dicari.'
        : 'Pahami dulu tujuan bisnis dan data apa yang perlu dibaca.';
    const domainStep = `Baca konteks utama dari domain ${domain.toLowerCase()} yang paling relevan.`;
    const lastStep =
      insightType === 'RECOMMENDATION'
        ? 'Susun rekomendasi berdasarkan dampak, urgensi, dan tingkat keyakinan.'
        : insightType === 'FORECAST'
          ? 'Proyeksikan sinyal saat ini ke horizon singkat yang mudah dibaca.'
          : 'Berikan jawaban yang jelas lalu arahkan user ke langkah atau view berikutnya.';

    return [firstStep, domainStep, lastStep];
  }
}
