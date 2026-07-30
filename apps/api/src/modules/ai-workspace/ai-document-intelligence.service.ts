import { Injectable } from '@nestjs/common';
import { type AiWorkspaceCapabilityKey } from '@nova/shared-types';

import {
  type AiDocumentIntelligencePreview,
  type AiWorkspaceCapabilitySummary,
} from './ai-workspace.types';
import {
  assertAiWorkspaceMin,
  assertAiWorkspacePercent,
  averageAiWorkspaceReadiness,
  countEnabledAiCapabilities,
  resolveAiWorkspaceStatus,
  roundAiWorkspaceMetric,
} from './ai-workspace-preview.utils';

export type AiDocumentIntelligenceCapabilityInput = {
  key: AiWorkspaceCapabilityKey;
  label: string;
  readinessPct: number;
  humanReviewReady: boolean;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
};

export type AiDocumentIntelligenceInput = {
  capabilities: AiDocumentIntelligenceCapabilityInput[];
  capabilitiesExpected: number;
  extractionCoveragePct: number;
  confidenceCoveragePct: number;
  reviewGovernancePct: number;
};

@Injectable()
export class AiDocumentIntelligenceService {
  previewReadiness(input: AiDocumentIntelligenceInput): AiDocumentIntelligencePreview {
    assertAiWorkspaceMin(
      'Document intelligence capabilities expected',
      input.capabilitiesExpected,
      1,
    );
    assertAiWorkspacePercent('Extraction coverage pct', input.extractionCoveragePct);
    assertAiWorkspacePercent('Confidence coverage pct', input.confidenceCoveragePct);
    assertAiWorkspacePercent('Review governance pct', input.reviewGovernancePct);

    const capabilities = input.capabilities.map((capability) => this.buildCapability(capability));
    const enabledCapabilities = countEnabledAiCapabilities(
      capabilities.map((capability) => capability.readinessPct),
    );
    const capabilityCoveragePct = roundAiWorkspaceMetric(
      (enabledCapabilities / input.capabilitiesExpected) * 100,
    );
    const readinessPct = averageAiWorkspaceReadiness([
      capabilityCoveragePct,
      input.extractionCoveragePct,
      input.confidenceCoveragePct,
      input.reviewGovernancePct,
    ]);
    const status = resolveAiWorkspaceStatus({
      readinessPct,
      blockers: [enabledCapabilities === 0],
    });
    const nextFocus = this.resolveNextFocus(status);

    return {
      area: 'DOCUMENT_INTELLIGENCE',
      status,
      enabledCapabilities,
      capabilitiesExpected: input.capabilitiesExpected,
      extractionCoveragePct: roundAiWorkspaceMetric(input.extractionCoveragePct),
      confidenceCoveragePct: roundAiWorkspaceMetric(input.confidenceCoveragePct),
      reviewGovernancePct: roundAiWorkspaceMetric(input.reviewGovernancePct),
      nextFocus,
      summary: this.buildSummary(status, nextFocus),
      capabilities,
    };
  }

  private buildCapability(
    input: AiDocumentIntelligenceCapabilityInput,
  ): AiWorkspaceCapabilitySummary {
    assertAiWorkspacePercent(`${input.label} readiness pct`, input.readinessPct);
    assertAiWorkspaceMin(`${input.label} route count`, input.routeCount, 1);

    const status = resolveAiWorkspaceStatus({
      readinessPct: input.readinessPct,
      blockers: [!input.humanReviewReady],
    });

    return {
      key: input.key,
      label: input.label,
      status,
      readinessPct: roundAiWorkspaceMetric(input.readinessPct),
      routeCount: input.routeCount,
      primaryUseCase: input.primaryUseCase,
      nextFocus: input.nextFocus,
      summary: `${input.label} ${this.describeStatus(status)} for OCR, extraction, and structured document review. ${input.nextFocus}`,
    };
  }

  private describeStatus(status: AiDocumentIntelligencePreview['status']): string {
    switch (status) {
      case 'READY':
        return 'is ready';
      case 'FOUNDATION':
        return 'has a solid foundation';
      case 'LIMITED':
        return 'is still limited';
      case 'BLOCKED':
        return 'is blocked';
    }
  }

  private resolveNextFocus(status: AiDocumentIntelligencePreview['status']): string {
    switch (status) {
      case 'BLOCKED':
        return 'Complete review policy, confidence thresholds, and exception handling before broad document automation.';
      case 'LIMITED':
        return 'Increase extraction confidence and reviewer ergonomics so document AI becomes safer to use daily.';
      case 'FOUNDATION':
        return 'Broaden coverage across invoices, receipts, and contracts before pushing self-serve document intelligence.';
      case 'READY':
        return 'Scale document intelligence with template governance, auditability, and faster exception triage.';
    }
  }

  private buildSummary(status: AiDocumentIntelligencePreview['status'], nextFocus: string): string {
    switch (status) {
      case 'BLOCKED':
        return `Document intelligence is blocked on reviewer governance or confidence handling. ${nextFocus}`;
      case 'LIMITED':
        return `OCR and extraction lanes exist, but confidence and review coverage still need work. ${nextFocus}`;
      case 'FOUNDATION':
        return `Document intelligence foundation can already support guided extraction and review workflows. ${nextFocus}`;
      case 'READY':
        return `Document intelligence coverage is ready for broader OCR, extraction, and contract review adoption. ${nextFocus}`;
    }
  }
}
