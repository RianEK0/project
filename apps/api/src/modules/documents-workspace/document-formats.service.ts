import { Injectable } from '@nestjs/common';
import { type DocumentWorkspaceCapabilityKey } from '@nova/shared-types';

import {
  type DocumentFormatsPreview,
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

export type DocumentFormatsCapabilityInput = {
  key: DocumentWorkspaceCapabilityKey;
  label: string;
  readinessPct: number;
  previewReady: boolean;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
};

export type DocumentFormatsInput = {
  capabilities: DocumentFormatsCapabilityInput[];
  capabilitiesExpected: number;
  previewSupportPct: number;
  editingContinuityPct: number;
  searchabilityPct: number;
};

@Injectable()
export class DocumentFormatsService {
  previewReadiness(input: DocumentFormatsInput): DocumentFormatsPreview {
    assertDocumentsWorkspaceMin(
      'Document format capabilities expected',
      input.capabilitiesExpected,
      1,
    );
    assertDocumentsWorkspacePercent('Preview support pct', input.previewSupportPct);
    assertDocumentsWorkspacePercent('Editing continuity pct', input.editingContinuityPct);
    assertDocumentsWorkspacePercent('Searchability pct', input.searchabilityPct);

    const capabilities = input.capabilities.map((capability) => this.buildCapability(capability));
    const enabledCapabilities = countEnabledDocumentCapabilities(
      capabilities.map((capability) => capability.readinessPct),
    );
    const capabilityCoveragePct = roundDocumentsWorkspaceMetric(
      (enabledCapabilities / input.capabilitiesExpected) * 100,
    );
    const readinessPct = averageDocumentsWorkspaceReadiness([
      capabilityCoveragePct,
      input.previewSupportPct,
      input.editingContinuityPct,
      input.searchabilityPct,
    ]);
    const status = resolveDocumentsWorkspaceStatus({
      readinessPct,
      blockers: [enabledCapabilities === 0],
    });
    const nextFocus = this.resolveNextFocus(status);

    return {
      area: 'FILE_FORMATS',
      status,
      enabledCapabilities,
      capabilitiesExpected: input.capabilitiesExpected,
      previewSupportPct: roundDocumentsWorkspaceMetric(input.previewSupportPct),
      editingContinuityPct: roundDocumentsWorkspaceMetric(input.editingContinuityPct),
      searchabilityPct: roundDocumentsWorkspaceMetric(input.searchabilityPct),
      nextFocus,
      summary: this.buildSummary(status, nextFocus),
      capabilities,
    };
  }

  private buildCapability(
    input: DocumentFormatsCapabilityInput,
  ): DocumentsWorkspaceCapabilitySummary {
    assertDocumentsWorkspacePercent(`${input.label} readiness pct`, input.readinessPct);
    assertDocumentsWorkspaceMin(`${input.label} route count`, input.routeCount, 1);

    const status = resolveDocumentsWorkspaceStatus({
      readinessPct: input.readinessPct,
      blockers: [!input.previewReady],
    });

    return {
      key: input.key,
      label: input.label,
      status,
      readinessPct: roundDocumentsWorkspaceMetric(input.readinessPct),
      routeCount: input.routeCount,
      primaryUseCase: input.primaryUseCase,
      nextFocus: input.nextFocus,
      summary: `${input.label} ${this.describeStatus(status)} for governed previews, searchability, and operator-friendly document access. ${input.nextFocus}`,
    };
  }

  private describeStatus(status: DocumentFormatsPreview['status']): string {
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

  private resolveNextFocus(status: DocumentFormatsPreview['status']): string {
    switch (status) {
      case 'BLOCKED':
        return 'Stabilize preview rendering and metadata extraction before users depend on the file format lane.';
      case 'LIMITED':
        return 'Improve consistent preview, search, and handoff behavior across PDF, Word, and Excel documents.';
      case 'FOUNDATION':
        return 'Broaden export fidelity and search indexing so document formats feel dependable across teams.';
      case 'READY':
        return 'Scale format support with richer annotations, templates, and enterprise-grade review handoffs.';
    }
  }

  private buildSummary(status: DocumentFormatsPreview['status'], nextFocus: string): string {
    switch (status) {
      case 'BLOCKED':
        return `Document format coverage is blocked on preview or metadata continuity. ${nextFocus}`;
      case 'LIMITED':
        return `Core business file formats are available, but the experience is still uneven. ${nextFocus}`;
      case 'FOUNDATION':
        return `Document format handling can already support day-to-day governed access for most teams. ${nextFocus}`;
      case 'READY':
        return `Document format support is ready for broader enterprise usage and governed document review. ${nextFocus}`;
    }
  }
}
