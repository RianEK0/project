import { Injectable } from '@nestjs/common';
import { type AnalyticsWorkspaceCapabilityKey } from '@nova/shared-types';

import {
  type AnalyticsEntityIntelligencePreview,
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

export type AnalyticsEntityIntelligenceCapabilityInput = {
  key: AnalyticsWorkspaceCapabilityKey;
  label: string;
  readinessPct: number;
  entityReady: boolean;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
};

export type AnalyticsEntityIntelligenceInput = {
  capabilities: AnalyticsEntityIntelligenceCapabilityInput[];
  capabilitiesExpected: number;
  customerCoveragePct: number;
  supplierCoveragePct: number;
  warehouseCoveragePct: number;
};

@Injectable()
export class AnalyticsEntityIntelligenceService {
  previewReadiness(input: AnalyticsEntityIntelligenceInput): AnalyticsEntityIntelligencePreview {
    assertAnalyticsWorkspaceMin(
      'Entity intelligence capabilities expected',
      input.capabilitiesExpected,
      1,
    );
    assertAnalyticsWorkspacePercent('Customer coverage pct', input.customerCoveragePct);
    assertAnalyticsWorkspacePercent('Supplier coverage pct', input.supplierCoveragePct);
    assertAnalyticsWorkspacePercent('Warehouse coverage pct', input.warehouseCoveragePct);

    const capabilities = input.capabilities.map((capability) => this.buildCapability(capability));
    const enabledCapabilities = countEnabledAnalyticsCapabilities(
      capabilities.map((capability) => capability.readinessPct),
    );
    const capabilityCoveragePct = roundAnalyticsWorkspaceMetric(
      (enabledCapabilities / input.capabilitiesExpected) * 100,
    );
    const readinessPct = averageAnalyticsWorkspaceReadiness([
      capabilityCoveragePct,
      input.customerCoveragePct,
      input.supplierCoveragePct,
      input.warehouseCoveragePct,
    ]);
    const status = resolveAnalyticsWorkspaceStatus({
      readinessPct,
      blockers: [enabledCapabilities === 0],
    });
    const nextFocus = this.resolveNextFocus(status);

    return {
      area: 'ENTITY_INTELLIGENCE',
      status,
      enabledCapabilities,
      capabilitiesExpected: input.capabilitiesExpected,
      customerCoveragePct: roundAnalyticsWorkspaceMetric(input.customerCoveragePct),
      supplierCoveragePct: roundAnalyticsWorkspaceMetric(input.supplierCoveragePct),
      warehouseCoveragePct: roundAnalyticsWorkspaceMetric(input.warehouseCoveragePct),
      nextFocus,
      summary: this.buildSummary(status, nextFocus),
      capabilities,
    };
  }

  private buildCapability(
    input: AnalyticsEntityIntelligenceCapabilityInput,
  ): AnalyticsWorkspaceCapabilitySummary {
    assertAnalyticsWorkspacePercent(`${input.label} readiness pct`, input.readinessPct);
    assertAnalyticsWorkspaceMin(`${input.label} route count`, input.routeCount, 1);

    const status = resolveAnalyticsWorkspaceStatus({
      readinessPct: input.readinessPct,
      blockers: [!input.entityReady],
    });

    return {
      key: input.key,
      label: input.label,
      status,
      readinessPct: roundAnalyticsWorkspaceMetric(input.readinessPct),
      routeCount: input.routeCount,
      primaryUseCase: input.primaryUseCase,
      nextFocus: input.nextFocus,
      summary: `${input.label} ${this.describeStatus(status)} for master-entity analytics and decision context. ${input.nextFocus}`,
    };
  }

  private describeStatus(status: AnalyticsEntityIntelligencePreview['status']): string {
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

  private resolveNextFocus(status: AnalyticsEntityIntelligencePreview['status']): string {
    switch (status) {
      case 'BLOCKED':
        return 'Stabilize entity keys and master definitions before scaling entity-centric BI.';
      case 'LIMITED':
        return 'Improve customer, supplier, and warehouse entity coverage so 360 analytics becomes more dependable.';
      case 'FOUNDATION':
        return 'Close master-profile and drill-through gaps before pushing entity intelligence to more personas.';
      case 'READY':
        return 'Expand entity 360 lanes with stronger segmentation and operational lineage for analysts and managers.';
    }
  }

  private buildSummary(
    status: AnalyticsEntityIntelligencePreview['status'],
    nextFocus: string,
  ): string {
    switch (status) {
      case 'BLOCKED':
        return `Entity intelligence is blocked on master-data consistency. ${nextFocus}`;
      case 'LIMITED':
        return `Customer, supplier, and warehouse analytics exist, but the 360 view is still narrow. ${nextFocus}`;
      case 'FOUNDATION':
        return `Entity intelligence foundation can already support guided customer, supplier, and warehouse review. ${nextFocus}`;
      case 'READY':
        return `Entity intelligence coverage is ready for broader master-data and relationship analysis. ${nextFocus}`;
    }
  }
}
