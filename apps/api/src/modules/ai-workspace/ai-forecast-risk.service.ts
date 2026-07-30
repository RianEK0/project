import { Injectable } from '@nestjs/common';
import { type AiWorkspaceCapabilityKey } from '@nova/shared-types';

import {
  type AiForecastRiskPreview,
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

export type AiForecastRiskCapabilityInput = {
  key: AiWorkspaceCapabilityKey;
  label: string;
  readinessPct: number;
  modelReady: boolean;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
};

export type AiForecastRiskInput = {
  capabilities: AiForecastRiskCapabilityInput[];
  capabilitiesExpected: number;
  forecastCoveragePct: number;
  anomalyCoveragePct: number;
  financeSignalCoveragePct: number;
};

@Injectable()
export class AiForecastRiskService {
  previewReadiness(input: AiForecastRiskInput): AiForecastRiskPreview {
    assertAiWorkspaceMin('Forecast and risk capabilities expected', input.capabilitiesExpected, 1);
    assertAiWorkspacePercent('Forecast coverage pct', input.forecastCoveragePct);
    assertAiWorkspacePercent('Anomaly coverage pct', input.anomalyCoveragePct);
    assertAiWorkspacePercent('Finance signal coverage pct', input.financeSignalCoveragePct);

    const capabilities = input.capabilities.map((capability) => this.buildCapability(capability));
    const enabledCapabilities = countEnabledAiCapabilities(
      capabilities.map((capability) => capability.readinessPct),
    );
    const capabilityCoveragePct = roundAiWorkspaceMetric(
      (enabledCapabilities / input.capabilitiesExpected) * 100,
    );
    const readinessPct = averageAiWorkspaceReadiness([
      capabilityCoveragePct,
      input.forecastCoveragePct,
      input.anomalyCoveragePct,
      input.financeSignalCoveragePct,
    ]);
    const status = resolveAiWorkspaceStatus({
      readinessPct,
      blockers: [enabledCapabilities === 0],
    });
    const nextFocus = this.resolveNextFocus(status);

    return {
      area: 'FORECAST_RISK',
      status,
      enabledCapabilities,
      capabilitiesExpected: input.capabilitiesExpected,
      forecastCoveragePct: roundAiWorkspaceMetric(input.forecastCoveragePct),
      anomalyCoveragePct: roundAiWorkspaceMetric(input.anomalyCoveragePct),
      financeSignalCoveragePct: roundAiWorkspaceMetric(input.financeSignalCoveragePct),
      nextFocus,
      summary: this.buildSummary(status, nextFocus),
      capabilities,
    };
  }

  private buildCapability(input: AiForecastRiskCapabilityInput): AiWorkspaceCapabilitySummary {
    assertAiWorkspacePercent(`${input.label} readiness pct`, input.readinessPct);
    assertAiWorkspaceMin(`${input.label} route count`, input.routeCount, 1);

    const status = resolveAiWorkspaceStatus({
      readinessPct: input.readinessPct,
      blockers: [!input.modelReady],
    });

    return {
      key: input.key,
      label: input.label,
      status,
      readinessPct: roundAiWorkspaceMetric(input.readinessPct),
      routeCount: input.routeCount,
      primaryUseCase: input.primaryUseCase,
      nextFocus: input.nextFocus,
      summary: `${input.label} ${this.describeStatus(status)} for forecasting, anomaly review, and financial risk packaging. ${input.nextFocus}`,
    };
  }

  private describeStatus(status: AiForecastRiskPreview['status']): string {
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

  private resolveNextFocus(status: AiForecastRiskPreview['status']): string {
    switch (status) {
      case 'BLOCKED':
        return 'Harden model coverage and exception review policy before widening AI-led forecasting and risk signals.';
      case 'LIMITED':
        return 'Increase forecast and anomaly coverage so finance and operations teams can trust AI risk signals more often.';
      case 'FOUNDATION':
        return 'Close scenario coverage and cash-risk interpretation gaps before scaling these signals to more tenants.';
      case 'READY':
        return 'Expand forecast and fraud-oriented signals with tenant-tuned thresholds and review templates.';
    }
  }

  private buildSummary(status: AiForecastRiskPreview['status'], nextFocus: string): string {
    switch (status) {
      case 'BLOCKED':
        return `AI forecast and risk controls are blocked on model or governance readiness. ${nextFocus}`;
      case 'LIMITED':
        return `Forecasting and risk signals exist, but anomaly and finance coverage is still uneven. ${nextFocus}`;
      case 'FOUNDATION':
        return `AI forecast and risk foundation can already support guided decision review. ${nextFocus}`;
      case 'READY':
        return `AI forecast and risk coverage is ready for broader operational and finance monitoring. ${nextFocus}`;
    }
  }
}
