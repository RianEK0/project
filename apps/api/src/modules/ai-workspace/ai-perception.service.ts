import { Injectable } from '@nestjs/common';
import { type AiWorkspaceCapabilityKey } from '@nova/shared-types';

import { type AiPerceptionPreview, type AiWorkspaceCapabilitySummary } from './ai-workspace.types';
import {
  assertAiWorkspaceMin,
  assertAiWorkspacePercent,
  averageAiWorkspaceReadiness,
  countEnabledAiCapabilities,
  resolveAiWorkspaceStatus,
  roundAiWorkspaceMetric,
} from './ai-workspace-preview.utils';

export type AiPerceptionCapabilityInput = {
  key: AiWorkspaceCapabilityKey;
  label: string;
  readinessPct: number;
  visualReviewReady: boolean;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
};

export type AiPerceptionInput = {
  capabilities: AiPerceptionCapabilityInput[];
  capabilitiesExpected: number;
  visualCoveragePct: number;
  countingAccuracyPct: number;
  safetyCompliancePct: number;
};

@Injectable()
export class AiPerceptionService {
  previewReadiness(input: AiPerceptionInput): AiPerceptionPreview {
    assertAiWorkspaceMin('Perception capabilities expected', input.capabilitiesExpected, 1);
    assertAiWorkspacePercent('Visual coverage pct', input.visualCoveragePct);
    assertAiWorkspacePercent('Counting accuracy pct', input.countingAccuracyPct);
    assertAiWorkspacePercent('Safety compliance pct', input.safetyCompliancePct);

    const capabilities = input.capabilities.map((capability) => this.buildCapability(capability));
    const enabledCapabilities = countEnabledAiCapabilities(
      capabilities.map((capability) => capability.readinessPct),
    );
    const capabilityCoveragePct = roundAiWorkspaceMetric(
      (enabledCapabilities / input.capabilitiesExpected) * 100,
    );
    const readinessPct = averageAiWorkspaceReadiness([
      capabilityCoveragePct,
      input.visualCoveragePct,
      input.countingAccuracyPct,
      input.safetyCompliancePct,
    ]);
    const status = resolveAiWorkspaceStatus({
      readinessPct,
      blockers: [enabledCapabilities === 0],
    });
    const nextFocus = this.resolveNextFocus(status);

    return {
      area: 'PERCEPTION',
      status,
      enabledCapabilities,
      capabilitiesExpected: input.capabilitiesExpected,
      visualCoveragePct: roundAiWorkspaceMetric(input.visualCoveragePct),
      countingAccuracyPct: roundAiWorkspaceMetric(input.countingAccuracyPct),
      safetyCompliancePct: roundAiWorkspaceMetric(input.safetyCompliancePct),
      nextFocus,
      summary: this.buildSummary(status, nextFocus),
      capabilities,
    };
  }

  private buildCapability(input: AiPerceptionCapabilityInput): AiWorkspaceCapabilitySummary {
    assertAiWorkspacePercent(`${input.label} readiness pct`, input.readinessPct);
    assertAiWorkspaceMin(`${input.label} route count`, input.routeCount, 1);

    const status = resolveAiWorkspaceStatus({
      readinessPct: input.readinessPct,
      blockers: [!input.visualReviewReady],
    });

    return {
      key: input.key,
      label: input.label,
      status,
      readinessPct: roundAiWorkspaceMetric(input.readinessPct),
      routeCount: input.routeCount,
      primaryUseCase: input.primaryUseCase,
      nextFocus: input.nextFocus,
      summary: `${input.label} ${this.describeStatus(status)} for camera-driven stock, attendance, and safety checks. ${input.nextFocus}`,
    };
  }

  private describeStatus(status: AiPerceptionPreview['status']): string {
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

  private resolveNextFocus(status: AiPerceptionPreview['status']): string {
    switch (status) {
      case 'BLOCKED':
        return 'Stabilize camera capture governance, count verification, and safety review before broader rollout.';
      case 'LIMITED':
        return 'Improve rack counting, attendance matching, and PPE verification so perception workflows can support the floor safely.';
      case 'FOUNDATION':
        return 'Close camera exception and supervisor review gaps before promoting perception to more warehouse and HR teams.';
      case 'READY':
        return 'Expand perception flows into cycle counting, gate attendance, and safety patrol routines.';
    }
  }

  private buildSummary(status: AiPerceptionPreview['status'], nextFocus: string): string {
    switch (status) {
      case 'BLOCKED':
        return `AI perception is blocked on camera governance or visual review controls. ${nextFocus}`;
      case 'LIMITED':
        return `Camera-based AI perception exists, but counting accuracy and safety interpretation still need more work. ${nextFocus}`;
      case 'FOUNDATION':
        return `AI perception can already support guided rack scans, attendance checks, and PPE review. ${nextFocus}`;
      case 'READY':
        return `AI perception coverage is ready for broader warehouse, attendance, and safety routines. ${nextFocus}`;
    }
  }
}
