import { Injectable } from '@nestjs/common';
import { type DocumentWorkspaceCapabilityKey } from '@nova/shared-types';

import {
  type DocumentGovernancePreview,
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

export type DocumentGovernanceCapabilityInput = {
  key: DocumentWorkspaceCapabilityKey;
  label: string;
  readinessPct: number;
  publishReady: boolean;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
};

export type DocumentGovernanceInput = {
  capabilities: DocumentGovernanceCapabilityInput[];
  capabilitiesExpected: number;
  sopCoveragePct: number;
  trainingCoveragePct: number;
  policyControlPct: number;
};

@Injectable()
export class DocumentGovernanceService {
  previewReadiness(input: DocumentGovernanceInput): DocumentGovernancePreview {
    assertDocumentsWorkspaceMin(
      'Document governance capabilities expected',
      input.capabilitiesExpected,
      1,
    );
    assertDocumentsWorkspacePercent('SOP coverage pct', input.sopCoveragePct);
    assertDocumentsWorkspacePercent('Training coverage pct', input.trainingCoveragePct);
    assertDocumentsWorkspacePercent('Policy control pct', input.policyControlPct);

    const capabilities = input.capabilities.map((capability) => this.buildCapability(capability));
    const enabledCapabilities = countEnabledDocumentCapabilities(
      capabilities.map((capability) => capability.readinessPct),
    );
    const capabilityCoveragePct = roundDocumentsWorkspaceMetric(
      (enabledCapabilities / input.capabilitiesExpected) * 100,
    );
    const readinessPct = averageDocumentsWorkspaceReadiness([
      capabilityCoveragePct,
      input.sopCoveragePct,
      input.trainingCoveragePct,
      input.policyControlPct,
    ]);
    const status = resolveDocumentsWorkspaceStatus({
      readinessPct,
      blockers: [enabledCapabilities === 0],
    });
    const nextFocus = this.resolveNextFocus(status);

    return {
      area: 'GOVERNANCE_KNOWLEDGE',
      status,
      enabledCapabilities,
      capabilitiesExpected: input.capabilitiesExpected,
      sopCoveragePct: roundDocumentsWorkspaceMetric(input.sopCoveragePct),
      trainingCoveragePct: roundDocumentsWorkspaceMetric(input.trainingCoveragePct),
      policyControlPct: roundDocumentsWorkspaceMetric(input.policyControlPct),
      nextFocus,
      summary: this.buildSummary(status, nextFocus),
      capabilities,
    };
  }

  private buildCapability(
    input: DocumentGovernanceCapabilityInput,
  ): DocumentsWorkspaceCapabilitySummary {
    assertDocumentsWorkspacePercent(`${input.label} readiness pct`, input.readinessPct);
    assertDocumentsWorkspaceMin(`${input.label} route count`, input.routeCount, 1);

    const status = resolveDocumentsWorkspaceStatus({
      readinessPct: input.readinessPct,
      blockers: [!input.publishReady],
    });

    return {
      key: input.key,
      label: input.label,
      status,
      readinessPct: roundDocumentsWorkspaceMetric(input.readinessPct),
      routeCount: input.routeCount,
      primaryUseCase: input.primaryUseCase,
      nextFocus: input.nextFocus,
      summary: `${input.label} ${this.describeStatus(status)} for governed publishing, controlled rollout, and reusable team knowledge. ${input.nextFocus}`,
    };
  }

  private describeStatus(status: DocumentGovernancePreview['status']): string {
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

  private resolveNextFocus(status: DocumentGovernancePreview['status']): string {
    switch (status) {
      case 'BLOCKED':
        return 'Stabilize governed publishing and ownership before teams depend on SOP, policy, or training rollouts here.';
      case 'LIMITED':
        return 'Improve publishing controls and catalog consistency so knowledge documents stay trusted across branches and teams.';
      case 'FOUNDATION':
        return 'Close the remaining lifecycle and evidence gaps before scaling broader document governance self-service.';
      case 'READY':
        return 'Scale reusable training packs, policy bundles, and cross-functional SOP governance with stronger review automation.';
    }
  }

  private buildSummary(status: DocumentGovernancePreview['status'], nextFocus: string): string {
    switch (status) {
      case 'BLOCKED':
        return `Governance and knowledge documents are blocked on publishing or control readiness. ${nextFocus}`;
      case 'LIMITED':
        return `SOP, manual, training, and policy surfaces exist, but governance is still inconsistent. ${nextFocus}`;
      case 'FOUNDATION':
        return `Governance and knowledge documents can already support guided enterprise rollout and review. ${nextFocus}`;
      case 'READY':
        return `Governance and knowledge document controls are ready for broader enterprise enablement. ${nextFocus}`;
    }
  }
}
