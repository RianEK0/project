import { Injectable } from '@nestjs/common';
import { type DocumentWorkspaceCapabilityKey } from '@nova/shared-types';

import {
  type DocumentRecordsPreview,
  type DocumentsWorkspaceCapabilitySummary,
} from './documents-workspace.types';
import {
  assertDocumentsWorkspaceMin,
  assertDocumentsWorkspacePercent,
  averageDocumentsWorkspaceReadiness,
  countEnabledDocumentCapabilities,
  resolveDocumentsWorkspaceStatus,
  roundDocumentsWorkspaceMetric,
} from './documents-workspace-preview.utils';

export type DocumentRecordsCapabilityInput = {
  key: DocumentWorkspaceCapabilityKey;
  label: string;
  readinessPct: number;
  reviewReady: boolean;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
};

export type DocumentRecordsInput = {
  capabilities: DocumentRecordsCapabilityInput[];
  capabilitiesExpected: number;
  contractCoveragePct: number;
  invoiceCoveragePct: number;
  approvalTraceabilityPct: number;
};

@Injectable()
export class DocumentRecordsService {
  previewReadiness(input: DocumentRecordsInput): DocumentRecordsPreview {
    assertDocumentsWorkspaceMin(
      'Document record capabilities expected',
      input.capabilitiesExpected,
      1,
    );
    assertDocumentsWorkspacePercent('Contract coverage pct', input.contractCoveragePct);
    assertDocumentsWorkspacePercent('Invoice coverage pct', input.invoiceCoveragePct);
    assertDocumentsWorkspacePercent('Approval traceability pct', input.approvalTraceabilityPct);

    const capabilities = input.capabilities.map((capability) => this.buildCapability(capability));
    const enabledCapabilities = countEnabledDocumentCapabilities(
      capabilities.map((capability) => capability.readinessPct),
    );
    const capabilityCoveragePct = roundDocumentsWorkspaceMetric(
      (enabledCapabilities / input.capabilitiesExpected) * 100,
    );
    const readinessPct = averageDocumentsWorkspaceReadiness([
      capabilityCoveragePct,
      input.contractCoveragePct,
      input.invoiceCoveragePct,
      input.approvalTraceabilityPct,
    ]);
    const status = resolveDocumentsWorkspaceStatus({
      readinessPct,
      blockers: [enabledCapabilities === 0],
    });
    const nextFocus = this.resolveNextFocus(status);

    return {
      area: 'BUSINESS_RECORDS',
      status,
      enabledCapabilities,
      capabilitiesExpected: input.capabilitiesExpected,
      contractCoveragePct: roundDocumentsWorkspaceMetric(input.contractCoveragePct),
      invoiceCoveragePct: roundDocumentsWorkspaceMetric(input.invoiceCoveragePct),
      approvalTraceabilityPct: roundDocumentsWorkspaceMetric(input.approvalTraceabilityPct),
      nextFocus,
      summary: this.buildSummary(status, nextFocus),
      capabilities,
    };
  }

  private buildCapability(
    input: DocumentRecordsCapabilityInput,
  ): DocumentsWorkspaceCapabilitySummary {
    assertDocumentsWorkspacePercent(`${input.label} readiness pct`, input.readinessPct);
    assertDocumentsWorkspaceMin(`${input.label} route count`, input.routeCount, 1);

    const status = resolveDocumentsWorkspaceStatus({
      readinessPct: input.readinessPct,
      blockers: [!input.reviewReady],
    });

    return {
      key: input.key,
      label: input.label,
      status,
      readinessPct: roundDocumentsWorkspaceMetric(input.readinessPct),
      routeCount: input.routeCount,
      primaryUseCase: input.primaryUseCase,
      nextFocus: input.nextFocus,
      summary: `${input.label} ${this.describeStatus(status)} for governed document review, traceability, and execution handoff. ${input.nextFocus}`,
    };
  }

  private describeStatus(status: DocumentRecordsPreview['status']): string {
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

  private resolveNextFocus(status: DocumentRecordsPreview['status']): string {
    switch (status) {
      case 'BLOCKED':
        return 'Stabilize document ownership and approval lineage before contracts or invoices depend on this lane.';
      case 'LIMITED':
        return 'Strengthen contract and invoice traceability so record review stays connected to finance and procurement execution.';
      case 'FOUNDATION':
        return 'Close the remaining review and approval gaps before scaling cross-functional document handoffs.';
      case 'READY':
        return 'Expand governed lifecycle controls, exception review, and linked evidence around operational business records.';
    }
  }

  private buildSummary(status: DocumentRecordsPreview['status'], nextFocus: string): string {
    switch (status) {
      case 'BLOCKED':
        return `Business record governance is blocked on review or traceability readiness. ${nextFocus}`;
      case 'LIMITED':
        return `Contract and invoice document surfaces exist, but the operational trail is still incomplete. ${nextFocus}`;
      case 'FOUNDATION':
        return `Business records can already support guided contract and invoice review across NovaERP workflows. ${nextFocus}`;
      case 'READY':
        return `Contract and invoice document handling is ready for broader governed enterprise usage. ${nextFocus}`;
    }
  }
}
