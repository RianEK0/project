import { Injectable } from '@nestjs/common';
import { type PlatformCapabilityKey } from '@nova/shared-types';

import {
  type PlatformControlSummary,
  type PlatformTopologyPreview,
} from './platform-workspace.types';
import {
  assertPlatformMin,
  assertPlatformPercent,
  averagePlatformReadiness,
  countEnabledControls,
  resolvePlatformStatus,
  roundPlatformMetric,
} from './platform-workspace-preview.utils';

export type PlatformTopologyControlInput = {
  key: PlatformCapabilityKey;
  label: string;
  readinessPct: number;
  policyReady: boolean;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
};

export type PlatformTopologyInput = {
  controls: PlatformTopologyControlInput[];
  controlsExpected: number;
  companyScopePct: number;
  branchCoveragePct: number;
  warehouseCoveragePct: number;
  localeCoveragePct: number;
};

@Injectable()
export class PlatformTopologyService {
  previewReadiness(input: PlatformTopologyInput): PlatformTopologyPreview {
    assertPlatformMin('Topology controls expected', input.controlsExpected, 1);
    assertPlatformPercent('Company scope pct', input.companyScopePct);
    assertPlatformPercent('Branch coverage pct', input.branchCoveragePct);
    assertPlatformPercent('Warehouse coverage pct', input.warehouseCoveragePct);
    assertPlatformPercent('Locale coverage pct', input.localeCoveragePct);

    const controls = input.controls.map((control) => this.buildControl(control));
    const enabledControls = countEnabledControls(controls.map((control) => control.readinessPct));
    const controlCoveragePct = roundPlatformMetric(
      (enabledControls / input.controlsExpected) * 100,
    );
    const readinessPct = averagePlatformReadiness([
      controlCoveragePct,
      input.companyScopePct,
      input.branchCoveragePct,
      input.warehouseCoveragePct,
      input.localeCoveragePct,
    ]);
    const status = resolvePlatformStatus({
      readinessPct,
      blockers: [enabledControls === 0],
    });
    const nextFocus = this.resolveNextFocus(status);

    return {
      area: 'TOPOLOGY',
      status,
      enabledControls,
      controlsExpected: input.controlsExpected,
      companyScopePct: roundPlatformMetric(input.companyScopePct),
      branchCoveragePct: roundPlatformMetric(input.branchCoveragePct),
      warehouseCoveragePct: roundPlatformMetric(input.warehouseCoveragePct),
      localeCoveragePct: roundPlatformMetric(input.localeCoveragePct),
      nextFocus,
      summary: this.buildSummary(status, nextFocus),
      controls,
    };
  }

  private buildControl(input: PlatformTopologyControlInput): PlatformControlSummary {
    assertPlatformPercent(`${input.label} readiness pct`, input.readinessPct);
    assertPlatformMin(`${input.label} route count`, input.routeCount, 1);

    const status = resolvePlatformStatus({
      readinessPct: input.readinessPct,
      blockers: [!input.policyReady],
    });

    return {
      key: input.key,
      label: input.label,
      status,
      readinessPct: roundPlatformMetric(input.readinessPct),
      routeCount: input.routeCount,
      primaryUseCase: input.primaryUseCase,
      nextFocus: input.nextFocus,
      summary: `${input.label} ${this.describeStatus(status)} for tenant topology, geographic scope, and operating defaults. ${input.nextFocus}`,
    };
  }

  private describeStatus(status: PlatformTopologyPreview['status']): string {
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

  private resolveNextFocus(status: PlatformTopologyPreview['status']): string {
    switch (status) {
      case 'BLOCKED':
        return 'Finalize tenant-scope policy and hierarchy guardrails before enabling complex organization topologies.';
      case 'LIMITED':
        return 'Raise branch, warehouse, and locale coverage so multi-entity operations behave consistently.';
      case 'FOUNDATION':
        return 'Finish locale and operating-default alignment before scaling the topology model to more enterprise tenants.';
      case 'READY':
        return 'Expand topology onboarding with stronger provisioning templates for global and multi-entity customers.';
    }
  }

  private buildSummary(status: PlatformTopologyPreview['status'], nextFocus: string): string {
    switch (status) {
      case 'BLOCKED':
        return `Platform topology is not yet safe for advanced multi-entity rollout. ${nextFocus}`;
      case 'LIMITED':
        return `Multi-company, branch, warehouse, and locale controls exist, but coverage is still uneven. ${nextFocus}`;
      case 'FOUNDATION':
        return `Platform topology foundation can already support staged enterprise onboarding. ${nextFocus}`;
      case 'READY':
        return `Platform topology coverage is ready for broader multi-company and global tenant rollout. ${nextFocus}`;
    }
  }
}
