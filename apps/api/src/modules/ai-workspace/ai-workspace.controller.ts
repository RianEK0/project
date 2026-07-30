import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  aiWorkspaceAreas,
  aiWorkspaceCapabilityKeys,
  aiWorkspaceCapabilityStatuses,
} from '@nova/shared-types';

import { AiAssistantsService } from './ai-assistants.service';
import { AiCommandCenterService } from './ai-command-center.service';
import { AiDocumentIntelligenceService } from './ai-document-intelligence.service';
import { AiForecastRiskService } from './ai-forecast-risk.service';
import { AiOptimizationService } from './ai-optimization.service';
import { AiPerceptionService } from './ai-perception.service';

@ApiTags('AI Workspace')
@Controller({
  path: 'ai-workspace',
  version: '1',
})
export class AiWorkspaceController {
  constructor(
    private readonly aiCommandCenterService: AiCommandCenterService,
    private readonly aiForecastRiskService: AiForecastRiskService,
    private readonly aiOptimizationService: AiOptimizationService,
    private readonly aiDocumentIntelligenceService: AiDocumentIntelligenceService,
    private readonly aiPerceptionService: AiPerceptionService,
    private readonly aiAssistantsService: AiAssistantsService,
  ) {}

  @Get()
  getWorkspace() {
    return {
      capabilities: aiWorkspaceCapabilityKeys,
      areas: aiWorkspaceAreas,
      statuses: aiWorkspaceCapabilityStatuses,
      cards: [
        {
          id: 'command-center',
          label: 'Command Center',
          route: '/app/ai/copilot',
          description:
            'AI Copilot, AI dashboard, AI chat, and predictive analytics as the main command surface for cross-domain guidance.',
        },
        {
          id: 'forecast-risk',
          label: 'Forecast & Risk',
          route: '/app/ai/demand-forecasting',
          description:
            'Demand forecasting, fraud detection, and cash-flow prediction for proactive review.',
        },
        {
          id: 'optimization',
          label: 'Optimization',
          route: '/app/ai/inventory-optimization',
          description:
            'Inventory, procurement, sales, and warehouse optimization copilots tied to execution routes.',
        },
        {
          id: 'document-intelligence',
          label: 'Document Intelligence',
          route: '/app/ai/document-ocr',
          description:
            'OCR, invoice extraction, receipt extraction, and contract analysis under one governed lane.',
        },
        {
          id: 'perception',
          label: 'Perception',
          route: '/app/ai/vision',
          description:
            'Camera-based rack scan, warehouse counting, face attendance, and PPE detection for guided floor operations.',
        },
        {
          id: 'assistants',
          label: 'Assistants',
          route: '/app/ai/voice-assistant',
          description:
            'Voice assistant and meeting summary readiness for conversational execution support.',
        },
      ],
      relatedRoutes: [
        { label: 'AI Copilot', route: '/app/ai/copilot' },
        { label: 'Chat ERP', route: '/app/ai/chat-erp' },
        { label: 'AI Forecast', route: '/app/ai/forecast' },
        { label: 'AI Recommendations', route: '/app/ai/recommendations' },
        { label: 'AI Vision', route: '/app/ai/vision' },
        { label: 'AI Voice Assistant', route: '/app/ai/voice-assistant' },
        { label: 'AI Meeting Summary', route: '/app/ai/meeting-summary' },
        { label: 'Procurement Invoice Prep', route: '/app/procurement/invoice-preparation' },
        { label: 'Integrations', route: '/app/integrations' },
      ],
    };
  }

  @Get('command-center-preview')
  getCommandCenterPreview() {
    return this.aiCommandCenterService.previewReadiness({
      capabilitiesExpected: 4,
      dashboardCoveragePct: 89,
      orchestrationCoveragePct: 93,
      narrativeCoveragePct: 88,
      capabilities: [
        {
          key: 'AI_COPILOT',
          label: 'AI Copilot',
          readinessPct: 90,
          orchestrationReady: true,
          routeCount: 4,
          primaryUseCase:
            'Turn natural-language prompts into safe queries, tables, charts, narratives, and export-ready output.',
          nextFocus:
            'Expand guardrailed export packs and draft action hand-off into procurement, finance, and sales workspaces.',
        },
        {
          key: 'AI_DASHBOARD',
          label: 'AI Dashboard',
          readinessPct: 86,
          orchestrationReady: true,
          routeCount: 3,
          primaryUseCase:
            'Curate cross-domain AI scorecards and escalations for executives and operators.',
          nextFocus:
            'Expand persona-specific dashboard templates so AI signals land faster for finance and operations.',
        },
        {
          key: 'AI_CHAT',
          label: 'AI Chat',
          readinessPct: 92,
          orchestrationReady: true,
          routeCount: 3,
          primaryUseCase:
            'Give users one conversational lane into Chat ERP, search planning, and follow-up suggestions.',
          nextFocus:
            'Add stronger tenant context carry-over between chat, search, and action routes.',
        },
        {
          key: 'PREDICTIVE_ANALYTICS',
          label: 'Predictive Analytics',
          readinessPct: 83,
          orchestrationReady: true,
          routeCount: 3,
          primaryUseCase:
            'Package forward-looking operational and commercial trends before users dive into analytics views.',
          nextFocus:
            'Improve trend narratives for mixed procurement, sales, and warehouse signal packs.',
        },
      ],
    });
  }

  @Get('forecast-risk-preview')
  getForecastRiskPreview() {
    return this.aiForecastRiskService.previewReadiness({
      capabilitiesExpected: 3,
      forecastCoveragePct: 82,
      anomalyCoveragePct: 74,
      financeSignalCoveragePct: 79,
      capabilities: [
        {
          key: 'DEMAND_FORECASTING',
          label: 'Demand Forecasting',
          readinessPct: 84,
          modelReady: true,
          routeCount: 3,
          primaryUseCase:
            'Project demand shifts for replenishment, sourcing, and production planning reviews.',
          nextFocus: 'Expand forecast drill-downs for seasonal demand and service-level exposure.',
        },
        {
          key: 'FRAUD_DETECTION',
          label: 'Fraud Detection',
          readinessPct: 71,
          modelReady: true,
          routeCount: 2,
          primaryUseCase:
            'Surface unusual approval, payment, and exception behavior for finance oversight.',
          nextFocus: 'Map more procurement and payout scenarios into the anomaly review playbook.',
        },
        {
          key: 'CASH_FLOW_PREDICTION',
          label: 'Cash Flow Prediction',
          readinessPct: 78,
          modelReady: true,
          routeCount: 3,
          primaryUseCase:
            'Anticipate liquidity movement from invoices, payments, and short-term operational drivers.',
          nextFocus: 'Improve receivable and payable scenario modeling before broader rollout.',
        },
      ],
    });
  }

  @Get('optimization-preview')
  getOptimizationPreview() {
    return this.aiOptimizationService.previewReadiness({
      capabilitiesExpected: 4,
      recommendationCoveragePct: 81,
      executionLinkagePct: 77,
      crossDomainCoveragePct: 83,
      capabilities: [
        {
          key: 'AI_INVENTORY_OPTIMIZATION',
          label: 'AI Inventory Optimization',
          readinessPct: 85,
          executionReady: true,
          routeCount: 3,
          primaryUseCase:
            'Prioritize replenishment, excess stock, and stock-health interventions using AI ranking.',
          nextFocus:
            'Extend optimization to lot-sensitive and service-level-aware replenishment decisions.',
        },
        {
          key: 'AI_PROCUREMENT_OPTIMIZATION',
          label: 'AI Procurement Optimization',
          readinessPct: 79,
          executionReady: true,
          routeCount: 3,
          primaryUseCase:
            'Recommend sourcing actions based on vendor risk, lead time, and purchasing exposure.',
          nextFocus: 'Add scenario support for partial awards and alternative supplier mixes.',
        },
        {
          key: 'AI_SALES_RECOMMENDATION',
          label: 'AI Sales Recommendation',
          readinessPct: 82,
          executionReady: true,
          routeCount: 3,
          primaryUseCase:
            'Rank sales actions by conversion urgency, fulfillment risk, and collection pressure.',
          nextFocus:
            'Connect recommendation outcomes back into opportunity and collection follow-up patterns.',
        },
        {
          key: 'AI_WAREHOUSE_OPTIMIZATION',
          label: 'AI Warehouse Optimization',
          readinessPct: 76,
          executionReady: true,
          routeCount: 3,
          primaryUseCase:
            'Optimize task prioritization, congestion, and throughput from warehouse execution signals.',
          nextFocus: 'Strengthen operator acceptance flow for slotting and wave suggestions.',
        },
      ],
    });
  }

  @Get('document-intelligence-preview')
  getDocumentIntelligencePreview() {
    return this.aiDocumentIntelligenceService.previewReadiness({
      capabilitiesExpected: 4,
      extractionCoveragePct: 78,
      confidenceCoveragePct: 73,
      reviewGovernancePct: 80,
      capabilities: [
        {
          key: 'AI_DOCUMENT_OCR',
          label: 'AI Document OCR',
          readinessPct: 81,
          humanReviewReady: true,
          routeCount: 3,
          primaryUseCase:
            'Read uploaded invoice photos and PDFs into supplier, date, number, tax, item, and price fields before review.',
          nextFocus:
            'Improve multilingual OCR, blurry-photo handling, and database-ready confidence thresholds.',
        },
        {
          key: 'AI_INVOICE_EXTRACTION',
          label: 'AI Invoice Extraction',
          readinessPct: 77,
          humanReviewReady: true,
          routeCount: 3,
          primaryUseCase:
            'Extract invoice vendor, amount, due date, and tax context into finance review surfaces.',
          nextFocus: 'Expand tolerance checks for tax, line-item, and duplicate-invoice scenarios.',
        },
        {
          key: 'AI_RECEIPT_EXTRACTION',
          label: 'AI Receipt Extraction',
          readinessPct: 74,
          humanReviewReady: true,
          routeCount: 3,
          primaryUseCase:
            'Capture goods-receipt and expense evidence faster from warehouse and procurement documents.',
          nextFocus: 'Tighten exception handling for partial receipts and low-confidence captures.',
        },
        {
          key: 'AI_CONTRACT_ANALYSIS',
          label: 'Document AI',
          readinessPct: 79,
          humanReviewReady: true,
          routeCount: 3,
          primaryUseCase:
            'Summarize contracts, agreements, NDA, purchase orders, and invoices into deadlines, risks, amount, parties, and status.',
          nextFocus:
            'Add stronger clause-diff summaries and document-specific obligation extraction for procurement and finance review.',
        },
      ],
    });
  }

  @Get('perception-preview')
  getPerceptionPreview() {
    return this.aiPerceptionService.previewReadiness({
      capabilitiesExpected: 1,
      visualCoveragePct: 84,
      countingAccuracyPct: 81,
      safetyCompliancePct: 79,
      capabilities: [
        {
          key: 'AI_VISION',
          label: 'AI Vision',
          readinessPct: 83,
          visualReviewReady: true,
          routeCount: 4,
          primaryUseCase:
            'Use camera capture to scan racks, count warehouse stock, verify attendance, and detect PPE compliance.',
          nextFocus:
            'Improve barcode-plus-quantity reconciliation and raise supervisor confidence for face and PPE exception review.',
        },
      ],
    });
  }

  @Get('assistants-preview')
  getAssistantsPreview() {
    return this.aiAssistantsService.previewReadiness({
      capabilitiesExpected: 2,
      voiceCoveragePct: 80,
      transcriptGovernancePct: 82,
      followUpCapturePct: 78,
      capabilities: [
        {
          key: 'AI_VOICE_ASSISTANT',
          label: 'AI Voice Assistant',
          readinessPct: 81,
          transcriptReady: true,
          routeCount: 4,
          primaryUseCase:
            'Turn spoken ERP commands into draft purchase, stock, and finance actions with guarded confirmation steps.',
          nextFocus:
            'Improve noisy-environment capture and enrich domain-specific confirmation prompts for procurement and warehouse actions.',
        },
        {
          key: 'AI_MEETING_SUMMARY',
          label: 'AI Meeting Summary',
          readinessPct: 83,
          transcriptReady: true,
          routeCount: 4,
          primaryUseCase:
            'Summarize CRM, vendor, and internal meeting audio into summary, decisions, action items, deadlines, and PIC ownership.',
          nextFocus:
            'Map more follow-up outcomes directly into CRM tasks, tickets, reminders, and approval queues.',
        },
      ],
    });
  }
}
