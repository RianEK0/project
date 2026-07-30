import { Injectable } from '@nestjs/common';
import { type AiWorkspaceCapabilityKey } from '@nova/shared-types';

import {
  type AiCommandCenterPreview,
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

export type AiCommandCenterCapabilityInput = {
  key: AiWorkspaceCapabilityKey;
  label: string;
  readinessPct: number;
  orchestrationReady: boolean;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
};

export type AiCommandCenterInput = {
  capabilities: AiCommandCenterCapabilityInput[];
  capabilitiesExpected: number;
  dashboardCoveragePct: number;
  orchestrationCoveragePct: number;
  narrativeCoveragePct: number;
};

@Injectable()
export class AiCommandCenterService {
  previewReadiness(input: AiCommandCenterInput): AiCommandCenterPreview {
    assertAiWorkspaceMin('Command center capabilities expected', input.capabilitiesExpected, 1);
    assertAiWorkspacePercent('Dashboard coverage pct', input.dashboardCoveragePct);
    assertAiWorkspacePercent('Orchestration coverage pct', input.orchestrationCoveragePct);
    assertAiWorkspacePercent('Narrative coverage pct', input.narrativeCoveragePct);

    const capabilities = input.capabilities.map((capability) => this.buildCapability(capability));
    const enabledCapabilities = countEnabledAiCapabilities(
      capabilities.map((capability) => capability.readinessPct),
    );
    const capabilityCoveragePct = roundAiWorkspaceMetric(
      (enabledCapabilities / input.capabilitiesExpected) * 100,
    );
    const readinessPct = averageAiWorkspaceReadiness([
      capabilityCoveragePct,
      input.dashboardCoveragePct,
      input.orchestrationCoveragePct,
      input.narrativeCoveragePct,
    ]);
    const status = resolveAiWorkspaceStatus({
      readinessPct,
      blockers: [enabledCapabilities === 0],
    });
    const nextFocus = this.resolveNextFocus(status);

    return {
      area: 'COMMAND_CENTER',
      status,
      enabledCapabilities,
      capabilitiesExpected: input.capabilitiesExpected,
      dashboardCoveragePct: roundAiWorkspaceMetric(input.dashboardCoveragePct),
      orchestrationCoveragePct: roundAiWorkspaceMetric(input.orchestrationCoveragePct),
      narrativeCoveragePct: roundAiWorkspaceMetric(input.narrativeCoveragePct),
      nextFocus,
      summary: this.buildSummary(status, nextFocus),
      capabilities,
    };
  }

  private buildCapability(input: AiCommandCenterCapabilityInput): AiWorkspaceCapabilitySummary {
    assertAiWorkspacePercent(`${input.label} readiness pct`, input.readinessPct);
    assertAiWorkspaceMin(`${input.label} route count`, input.routeCount, 1);

    const status = resolveAiWorkspaceStatus({
      readinessPct: input.readinessPct,
      blockers: [!input.orchestrationReady],
    });

    return {
      key: input.key,
      label: input.label,
      status,
      readinessPct: roundAiWorkspaceMetric(input.readinessPct),
      routeCount: input.routeCount,
      primaryUseCase: input.primaryUseCase,
      nextFocus: input.nextFocus,
      summary: `${input.label} ${this.describeStatus(status)} for operator-facing AI command surfaces and decision visibility. ${input.nextFocus}`,
    };
  }

  private describeStatus(status: AiCommandCenterPreview['status']): string {
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

  private resolveNextFocus(status: AiCommandCenterPreview['status']): string {
    switch (status) {
      case 'BLOCKED':
        return 'Stabilize orchestration, dashboard storylines, and operator handoff before opening more AI command surfaces.';
      case 'LIMITED':
        return 'Increase dashboard coverage and guided narratives so AI command surfaces feel dependable for daily use.';
      case 'FOUNDATION':
        return 'Unify dashboard, chat, and predictive narratives before promoting the command center to more personas.';
      case 'READY':
        return 'Scale AI dashboard and chat entry points with stronger tenant-level briefing templates and monitoring.';
    }
  }

  private buildSummary(status: AiCommandCenterPreview['status'], nextFocus: string): string {
    switch (status) {
      case 'BLOCKED':
        return `AI command surfaces are blocked on orchestration or narrative readiness. ${nextFocus}`;
      case 'LIMITED':
        return `AI dashboard, chat, and predictive entry points exist, but operator trust is still uneven. ${nextFocus}`;
      case 'FOUNDATION':
        return `AI command center foundation can already support guided operational review and triage. ${nextFocus}`;
      case 'READY':
        return `AI command center coverage is ready for broader operator and executive usage. ${nextFocus}`;
    }
  }
}
