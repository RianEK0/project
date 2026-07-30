import { Injectable } from '@nestjs/common';
import { type AiWorkspaceCapabilityKey } from '@nova/shared-types';

import {
  type AiOptimizationPreview,
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

export type AiOptimizationCapabilityInput = {
  key: AiWorkspaceCapabilityKey;
  label: string;
  readinessPct: number;
  executionReady: boolean;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
};

export type AiOptimizationInput = {
  capabilities: AiOptimizationCapabilityInput[];
  capabilitiesExpected: number;
  recommendationCoveragePct: number;
  executionLinkagePct: number;
  crossDomainCoveragePct: number;
};

@Injectable()
export class AiOptimizationService {
  previewReadiness(input: AiOptimizationInput): AiOptimizationPreview {
    assertAiWorkspaceMin('Optimization capabilities expected', input.capabilitiesExpected, 1);
    assertAiWorkspacePercent('Recommendation coverage pct', input.recommendationCoveragePct);
    assertAiWorkspacePercent('Execution linkage pct', input.executionLinkagePct);
    assertAiWorkspacePercent('Cross-domain coverage pct', input.crossDomainCoveragePct);

    const capabilities = input.capabilities.map((capability) => this.buildCapability(capability));
    const enabledCapabilities = countEnabledAiCapabilities(
      capabilities.map((capability) => capability.readinessPct),
    );
    const capabilityCoveragePct = roundAiWorkspaceMetric(
      (enabledCapabilities / input.capabilitiesExpected) * 100,
    );
    const readinessPct = averageAiWorkspaceReadiness([
      capabilityCoveragePct,
      input.recommendationCoveragePct,
      input.executionLinkagePct,
      input.crossDomainCoveragePct,
    ]);
    const status = resolveAiWorkspaceStatus({
      readinessPct,
      blockers: [enabledCapabilities === 0],
    });
    const nextFocus = this.resolveNextFocus(status);

    return {
      area: 'OPTIMIZATION',
      status,
      enabledCapabilities,
      capabilitiesExpected: input.capabilitiesExpected,
      recommendationCoveragePct: roundAiWorkspaceMetric(input.recommendationCoveragePct),
      executionLinkagePct: roundAiWorkspaceMetric(input.executionLinkagePct),
      crossDomainCoveragePct: roundAiWorkspaceMetric(input.crossDomainCoveragePct),
      nextFocus,
      summary: this.buildSummary(status, nextFocus),
      capabilities,
    };
  }

  private buildCapability(input: AiOptimizationCapabilityInput): AiWorkspaceCapabilitySummary {
    assertAiWorkspacePercent(`${input.label} readiness pct`, input.readinessPct);
    assertAiWorkspaceMin(`${input.label} route count`, input.routeCount, 1);

    const status = resolveAiWorkspaceStatus({
      readinessPct: input.readinessPct,
      blockers: [!input.executionReady],
    });

    return {
      key: input.key,
      label: input.label,
      status,
      readinessPct: roundAiWorkspaceMetric(input.readinessPct),
      routeCount: input.routeCount,
      primaryUseCase: input.primaryUseCase,
      nextFocus: input.nextFocus,
      summary: `${input.label} ${this.describeStatus(status)} for AI-guided optimization and domain action prioritization. ${input.nextFocus}`,
    };
  }

  private describeStatus(status: AiOptimizationPreview['status']): string {
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

  private resolveNextFocus(status: AiOptimizationPreview['status']): string {
    switch (status) {
      case 'BLOCKED':
        return 'Strengthen execution handoff and exception policy before exposing optimization suggestions at scale.';
      case 'LIMITED':
        return 'Increase recommendation and execution linkage so optimization output translates into operator action faster.';
      case 'FOUNDATION':
        return 'Broaden cross-domain coverage and result tracking before scaling optimization to more tenants.';
      case 'READY':
        return 'Promote optimization surfaces with stronger feedback loops from inventory, procurement, sales, and warehouse execution.';
    }
  }

  private buildSummary(status: AiOptimizationPreview['status'], nextFocus: string): string {
    switch (status) {
      case 'BLOCKED':
        return `Optimization copilots are blocked on execution linkage or governance gaps. ${nextFocus}`;
      case 'LIMITED':
        return `Optimization guidance exists, but domain handoff is still inconsistent. ${nextFocus}`;
      case 'FOUNDATION':
        return `Optimization foundation can already support guided planning and recommendation review. ${nextFocus}`;
      case 'READY':
        return `Optimization coverage is ready for broader inventory, procurement, sales, and warehouse use. ${nextFocus}`;
    }
  }
}
