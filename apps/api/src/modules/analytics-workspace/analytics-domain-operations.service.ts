import { Injectable } from '@nestjs/common';
import { type AnalyticsWorkspaceCapabilityKey } from '@nova/shared-types';

import {
  type AnalyticsDomainOperationsPreview,
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

export type AnalyticsDomainOperationsCapabilityInput = {
  key: AnalyticsWorkspaceCapabilityKey;
  label: string;
  readinessPct: number;
  martReady: boolean;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
};

export type AnalyticsDomainOperationsInput = {
  capabilities: AnalyticsDomainOperationsCapabilityInput[];
  capabilitiesExpected: number;
  domainCoveragePct: number;
  dashboardAlignmentPct: number;
  crossProcessCoveragePct: number;
};

@Injectable()
export class AnalyticsDomainOperationsService {
  previewReadiness(input: AnalyticsDomainOperationsInput): AnalyticsDomainOperationsPreview {
    assertAnalyticsWorkspaceMin(
      'Domain operations capabilities expected',
      input.capabilitiesExpected,
      1,
    );
    assertAnalyticsWorkspacePercent('Domain coverage pct', input.domainCoveragePct);
    assertAnalyticsWorkspacePercent('Dashboard alignment pct', input.dashboardAlignmentPct);
    assertAnalyticsWorkspacePercent('Cross-process coverage pct', input.crossProcessCoveragePct);

    const capabilities = input.capabilities.map((capability) => this.buildCapability(capability));
    const enabledCapabilities = countEnabledAnalyticsCapabilities(
      capabilities.map((capability) => capability.readinessPct),
    );
    const capabilityCoveragePct = roundAnalyticsWorkspaceMetric(
      (enabledCapabilities / input.capabilitiesExpected) * 100,
    );
    const readinessPct = averageAnalyticsWorkspaceReadiness([
      capabilityCoveragePct,
      input.domainCoveragePct,
      input.dashboardAlignmentPct,
      input.crossProcessCoveragePct,
    ]);
    const status = resolveAnalyticsWorkspaceStatus({
      readinessPct,
      blockers: [enabledCapabilities === 0],
    });
    const nextFocus = this.resolveNextFocus(status);

    return {
      area: 'DOMAIN_OPERATIONS',
      status,
      enabledCapabilities,
      capabilitiesExpected: input.capabilitiesExpected,
      domainCoveragePct: roundAnalyticsWorkspaceMetric(input.domainCoveragePct),
      dashboardAlignmentPct: roundAnalyticsWorkspaceMetric(input.dashboardAlignmentPct),
      crossProcessCoveragePct: roundAnalyticsWorkspaceMetric(input.crossProcessCoveragePct),
      nextFocus,
      summary: this.buildSummary(status, nextFocus),
      capabilities,
    };
  }

  private buildCapability(
    input: AnalyticsDomainOperationsCapabilityInput,
  ): AnalyticsWorkspaceCapabilitySummary {
    assertAnalyticsWorkspacePercent(`${input.label} readiness pct`, input.readinessPct);
    assertAnalyticsWorkspaceMin(`${input.label} route count`, input.routeCount, 1);

    const status = resolveAnalyticsWorkspaceStatus({
      readinessPct: input.readinessPct,
      blockers: [!input.martReady],
    });

    return {
      key: input.key,
      label: input.label,
      status,
      readinessPct: roundAnalyticsWorkspaceMetric(input.readinessPct),
      routeCount: input.routeCount,
      primaryUseCase: input.primaryUseCase,
      nextFocus: input.nextFocus,
      summary: `${input.label} ${this.describeStatus(status)} for domain marts, BI routing, and decision review. ${input.nextFocus}`,
    };
  }

  private describeStatus(status: AnalyticsDomainOperationsPreview['status']): string {
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

  private resolveNextFocus(status: AnalyticsDomainOperationsPreview['status']): string {
    switch (status) {
      case 'BLOCKED':
        return 'Stabilize core marts and metric definitions before promoting cross-domain BI rollups.';
      case 'LIMITED':
        return 'Increase domain coverage and dashboard alignment so analytics consumers can trust one workspace for operational review.';
      case 'FOUNDATION':
        return 'Close the remaining KPI and cross-process gaps before opening broader self-serve BI across functions.';
      case 'READY':
        return 'Scale domain marts with deeper drill-downs and more opinionated KPI playbooks for operators and leaders.';
    }
  }

  private buildSummary(
    status: AnalyticsDomainOperationsPreview['status'],
    nextFocus: string,
  ): string {
    switch (status) {
      case 'BLOCKED':
        return `Domain analytics lanes are blocked on mart readiness or metric consistency. ${nextFocus}`;
      case 'LIMITED':
        return `Operational analytics exists across several domains, but coverage is still uneven. ${nextFocus}`;
      case 'FOUNDATION':
        return `Domain analytics foundation can already support guided BI review across core NovaERP functions. ${nextFocus}`;
      case 'READY':
        return `Domain analytics coverage is ready for broader BI consumption across operations and management. ${nextFocus}`;
    }
  }
}
