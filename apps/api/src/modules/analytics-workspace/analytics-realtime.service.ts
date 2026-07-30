import { Injectable } from '@nestjs/common';
import { type AnalyticsWorkspaceCapabilityKey } from '@nova/shared-types';

import {
  type AnalyticsRealtimePreview,
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

export type AnalyticsRealtimeCapabilityInput = {
  key: AnalyticsWorkspaceCapabilityKey;
  label: string;
  readinessPct: number;
  streamReady: boolean;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
};

export type AnalyticsRealtimeInput = {
  capabilities: AnalyticsRealtimeCapabilityInput[];
  capabilitiesExpected: number;
  streamCoveragePct: number;
  freshnessSlaPct: number;
  alertCoveragePct: number;
};

@Injectable()
export class AnalyticsRealtimeService {
  previewReadiness(input: AnalyticsRealtimeInput): AnalyticsRealtimePreview {
    assertAnalyticsWorkspaceMin('Realtime capabilities expected', input.capabilitiesExpected, 1);
    assertAnalyticsWorkspacePercent('Stream coverage pct', input.streamCoveragePct);
    assertAnalyticsWorkspacePercent('Freshness SLA pct', input.freshnessSlaPct);
    assertAnalyticsWorkspacePercent('Alert coverage pct', input.alertCoveragePct);

    const capabilities = input.capabilities.map((capability) => this.buildCapability(capability));
    const enabledCapabilities = countEnabledAnalyticsCapabilities(
      capabilities.map((capability) => capability.readinessPct),
    );
    const capabilityCoveragePct = roundAnalyticsWorkspaceMetric(
      (enabledCapabilities / input.capabilitiesExpected) * 100,
    );
    const readinessPct = averageAnalyticsWorkspaceReadiness([
      capabilityCoveragePct,
      input.streamCoveragePct,
      input.freshnessSlaPct,
      input.alertCoveragePct,
    ]);
    const status = resolveAnalyticsWorkspaceStatus({
      readinessPct,
      blockers: [enabledCapabilities === 0],
    });
    const nextFocus = this.resolveNextFocus(status);

    return {
      area: 'REALTIME',
      status,
      enabledCapabilities,
      capabilitiesExpected: input.capabilitiesExpected,
      streamCoveragePct: roundAnalyticsWorkspaceMetric(input.streamCoveragePct),
      freshnessSlaPct: roundAnalyticsWorkspaceMetric(input.freshnessSlaPct),
      alertCoveragePct: roundAnalyticsWorkspaceMetric(input.alertCoveragePct),
      nextFocus,
      summary: this.buildSummary(status, nextFocus),
      capabilities,
    };
  }

  private buildCapability(
    input: AnalyticsRealtimeCapabilityInput,
  ): AnalyticsWorkspaceCapabilitySummary {
    assertAnalyticsWorkspacePercent(`${input.label} readiness pct`, input.readinessPct);
    assertAnalyticsWorkspaceMin(`${input.label} route count`, input.routeCount, 1);

    const status = resolveAnalyticsWorkspaceStatus({
      readinessPct: input.readinessPct,
      blockers: [!input.streamReady],
    });

    return {
      key: input.key,
      label: input.label,
      status,
      readinessPct: roundAnalyticsWorkspaceMetric(input.readinessPct),
      routeCount: input.routeCount,
      primaryUseCase: input.primaryUseCase,
      nextFocus: input.nextFocus,
      summary: `${input.label} ${this.describeStatus(status)} for low-latency metrics, streaming visibility, and operational alerting. ${input.nextFocus}`,
    };
  }

  private describeStatus(status: AnalyticsRealtimePreview['status']): string {
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

  private resolveNextFocus(status: AnalyticsRealtimePreview['status']): string {
    switch (status) {
      case 'BLOCKED':
        return 'Stabilize event streams, freshness SLAs, and alert routes before relying on realtime BI.';
      case 'LIMITED':
        return 'Increase stream and alert coverage so realtime analytics becomes trustworthy for operational escalation.';
      case 'FOUNDATION':
        return 'Improve latency consistency and event lineage before broadening realtime analytics adoption.';
      case 'READY':
        return 'Scale realtime analytics with richer operational signals and more actionable alert bundles.';
    }
  }

  private buildSummary(status: AnalyticsRealtimePreview['status'], nextFocus: string): string {
    switch (status) {
      case 'BLOCKED':
        return `Realtime analytics is blocked on stream, freshness, or alerting readiness. ${nextFocus}`;
      case 'LIMITED':
        return `Realtime analytics exists, but low-latency coverage is still narrow. ${nextFocus}`;
      case 'FOUNDATION':
        return `Realtime analytics foundation can already support guided operational monitoring. ${nextFocus}`;
      case 'READY':
        return `Realtime analytics coverage is ready for broader low-latency operational decision support. ${nextFocus}`;
    }
  }
}
