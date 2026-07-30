import { Injectable } from '@nestjs/common';
import { type AnalyticsWorkspaceCapabilityKey } from '@nova/shared-types';

import {
  type AnalyticsSemanticModelPreview,
  type AnalyticsWorkspaceCapabilitySummary,
} from './analytics-workspace.types';
import {
  assertAnalyticsWorkspaceMin,
  assertAnalyticsWorkspacePercent,
  averageAnalyticsWorkspaceReadiness,
  countEnabledAnalyticsCapabilities,
  resolveAnalyticsWorkspaceStatus,
  roundAnalyticsWorkspaceMetric,
} from './analytics-workspace-preview.utils';

export type AnalyticsSemanticModelCapabilityInput = {
  key: AnalyticsWorkspaceCapabilityKey;
  label: string;
  readinessPct: number;
  semanticReady: boolean;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
};

export type AnalyticsSemanticModelInput = {
  capabilities: AnalyticsSemanticModelCapabilityInput[];
  capabilitiesExpected: number;
  factCoveragePct: number;
  dimensionCoveragePct: number;
  cubeReadinessPct: number;
};

@Injectable()
export class AnalyticsSemanticModelService {
  previewReadiness(input: AnalyticsSemanticModelInput): AnalyticsSemanticModelPreview {
    assertAnalyticsWorkspaceMin(
      'Semantic model capabilities expected',
      input.capabilitiesExpected,
      1,
    );
    assertAnalyticsWorkspacePercent('Fact coverage pct', input.factCoveragePct);
    assertAnalyticsWorkspacePercent('Dimension coverage pct', input.dimensionCoveragePct);
    assertAnalyticsWorkspacePercent('Cube readiness pct', input.cubeReadinessPct);

    const capabilities = input.capabilities.map((capability) => this.buildCapability(capability));
    const enabledCapabilities = countEnabledAnalyticsCapabilities(
      capabilities.map((capability) => capability.readinessPct),
    );
    const capabilityCoveragePct = roundAnalyticsWorkspaceMetric(
      (enabledCapabilities / input.capabilitiesExpected) * 100,
    );
    const readinessPct = averageAnalyticsWorkspaceReadiness([
      capabilityCoveragePct,
      input.factCoveragePct,
      input.dimensionCoveragePct,
      input.cubeReadinessPct,
    ]);
    const status = resolveAnalyticsWorkspaceStatus({
      readinessPct,
      blockers: [enabledCapabilities === 0],
    });
    const nextFocus = this.resolveNextFocus(status);

    return {
      area: 'SEMANTIC_MODEL',
      status,
      enabledCapabilities,
      capabilitiesExpected: input.capabilitiesExpected,
      factCoveragePct: roundAnalyticsWorkspaceMetric(input.factCoveragePct),
      dimensionCoveragePct: roundAnalyticsWorkspaceMetric(input.dimensionCoveragePct),
      cubeReadinessPct: roundAnalyticsWorkspaceMetric(input.cubeReadinessPct),
      nextFocus,
      summary: this.buildSummary(status, nextFocus),
      capabilities,
    };
  }

  private buildCapability(
    input: AnalyticsSemanticModelCapabilityInput,
  ): AnalyticsWorkspaceCapabilitySummary {
    assertAnalyticsWorkspacePercent(`${input.label} readiness pct`, input.readinessPct);
    assertAnalyticsWorkspaceMin(`${input.label} route count`, input.routeCount, 1);

    const status = resolveAnalyticsWorkspaceStatus({
      readinessPct: input.readinessPct,
      blockers: [!input.semanticReady],
    });

    return {
      key: input.key,
      label: input.label,
      status,
      readinessPct: roundAnalyticsWorkspaceMetric(input.readinessPct),
      routeCount: input.routeCount,
      primaryUseCase: input.primaryUseCase,
      nextFocus: input.nextFocus,
      summary: `${input.label} ${this.describeStatus(status)} for analytics semantic modeling and governed aggregation. ${input.nextFocus}`,
    };
  }

  private describeStatus(status: AnalyticsSemanticModelPreview['status']): string {
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

  private resolveNextFocus(status: AnalyticsSemanticModelPreview['status']): string {
    switch (status) {
      case 'BLOCKED':
        return 'Stabilize grains, surrogate keys, and semantic rules before scaling governed BI models.';
      case 'LIMITED':
        return 'Increase fact and dimension coverage so cubes and OLAP queries stay consistent for analysts.';
      case 'FOUNDATION':
        return 'Finish semantic modeling guardrails before broadening self-serve analytics across more domains.';
      case 'READY':
        return 'Expand governed semantic assets with more reusable cubes, drill paths, and metric contracts.';
    }
  }

  private buildSummary(status: AnalyticsSemanticModelPreview['status'], nextFocus: string): string {
    switch (status) {
      case 'BLOCKED':
        return `Semantic model readiness is blocked on grain or modeling consistency. ${nextFocus}`;
      case 'LIMITED':
        return `Fact tables, dimensions, OLAP, and cubes exist conceptually, but modeling coverage is still uneven. ${nextFocus}`;
      case 'FOUNDATION':
        return `Semantic model foundation can already support guided BI development and review. ${nextFocus}`;
      case 'READY':
        return `Semantic model coverage is ready for broader governed BI and OLAP exploration. ${nextFocus}`;
    }
  }
}
