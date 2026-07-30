import { Injectable } from '@nestjs/common';
import { type AiWorkspaceCapabilityKey } from '@nova/shared-types';

import { type AiAssistantsPreview, type AiWorkspaceCapabilitySummary } from './ai-workspace.types';
import {
  assertAiWorkspaceMin,
  assertAiWorkspacePercent,
  averageAiWorkspaceReadiness,
  countEnabledAiCapabilities,
  resolveAiWorkspaceStatus,
  roundAiWorkspaceMetric,
} from './ai-workspace-preview.utils';

export type AiAssistantsCapabilityInput = {
  key: AiWorkspaceCapabilityKey;
  label: string;
  readinessPct: number;
  transcriptReady: boolean;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
};

export type AiAssistantsInput = {
  capabilities: AiAssistantsCapabilityInput[];
  capabilitiesExpected: number;
  voiceCoveragePct: number;
  transcriptGovernancePct: number;
  followUpCapturePct: number;
};

@Injectable()
export class AiAssistantsService {
  previewReadiness(input: AiAssistantsInput): AiAssistantsPreview {
    assertAiWorkspaceMin('Assistants capabilities expected', input.capabilitiesExpected, 1);
    assertAiWorkspacePercent('Voice coverage pct', input.voiceCoveragePct);
    assertAiWorkspacePercent('Transcript governance pct', input.transcriptGovernancePct);
    assertAiWorkspacePercent('Follow-up capture pct', input.followUpCapturePct);

    const capabilities = input.capabilities.map((capability) => this.buildCapability(capability));
    const enabledCapabilities = countEnabledAiCapabilities(
      capabilities.map((capability) => capability.readinessPct),
    );
    const capabilityCoveragePct = roundAiWorkspaceMetric(
      (enabledCapabilities / input.capabilitiesExpected) * 100,
    );
    const readinessPct = averageAiWorkspaceReadiness([
      capabilityCoveragePct,
      input.voiceCoveragePct,
      input.transcriptGovernancePct,
      input.followUpCapturePct,
    ]);
    const status = resolveAiWorkspaceStatus({
      readinessPct,
      blockers: [enabledCapabilities === 0],
    });
    const nextFocus = this.resolveNextFocus(status);

    return {
      area: 'ASSISTANTS',
      status,
      enabledCapabilities,
      capabilitiesExpected: input.capabilitiesExpected,
      voiceCoveragePct: roundAiWorkspaceMetric(input.voiceCoveragePct),
      transcriptGovernancePct: roundAiWorkspaceMetric(input.transcriptGovernancePct),
      followUpCapturePct: roundAiWorkspaceMetric(input.followUpCapturePct),
      nextFocus,
      summary: this.buildSummary(status, nextFocus),
      capabilities,
    };
  }

  private buildCapability(input: AiAssistantsCapabilityInput): AiWorkspaceCapabilitySummary {
    assertAiWorkspacePercent(`${input.label} readiness pct`, input.readinessPct);
    assertAiWorkspaceMin(`${input.label} route count`, input.routeCount, 1);

    const status = resolveAiWorkspaceStatus({
      readinessPct: input.readinessPct,
      blockers: [!input.transcriptReady],
    });

    return {
      key: input.key,
      label: input.label,
      status,
      readinessPct: roundAiWorkspaceMetric(input.readinessPct),
      routeCount: input.routeCount,
      primaryUseCase: input.primaryUseCase,
      nextFocus: input.nextFocus,
      summary: `${input.label} ${this.describeStatus(status)} for conversational input, meeting capture, and follow-up handoff. ${input.nextFocus}`,
    };
  }

  private describeStatus(status: AiAssistantsPreview['status']): string {
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

  private resolveNextFocus(status: AiAssistantsPreview['status']): string {
    switch (status) {
      case 'BLOCKED':
        return 'Stabilize transcript governance, follow-up capture, and interaction policy before rolling out assistant surfaces broadly.';
      case 'LIMITED':
        return 'Improve voice handling and transcript governance so assistants can support real operator workflows safely.';
      case 'FOUNDATION':
        return 'Close follow-up capture and review gaps before promoting assistants to more teams.';
      case 'READY':
        return 'Expand assistant entry points with stronger meeting, support, and mobile follow-up workflows.';
    }
  }

  private buildSummary(status: AiAssistantsPreview['status'], nextFocus: string): string {
    switch (status) {
      case 'BLOCKED':
        return `Voice and meeting assistants are blocked on transcript or follow-up governance. ${nextFocus}`;
      case 'LIMITED':
        return `Assistant surfaces exist, but voice reliability and follow-up capture still need more work. ${nextFocus}`;
      case 'FOUNDATION':
        return `Assistant foundation can already support guided voice and meeting recap workflows. ${nextFocus}`;
      case 'READY':
        return `Assistant coverage is ready for broader voice guidance and meeting summarization use. ${nextFocus}`;
    }
  }
}
