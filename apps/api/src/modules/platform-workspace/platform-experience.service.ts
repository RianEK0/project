import { Injectable } from '@nestjs/common';
import { type PlatformCapabilityKey } from '@nova/shared-types';

import {
  type PlatformControlSummary,
  type PlatformExperiencePreview,
} from './platform-workspace.types';
import {
  assertPlatformMin,
  assertPlatformPercent,
  averagePlatformReadiness,
  countEnabledControls,
  resolvePlatformStatus,
  roundPlatformMetric,
} from './platform-workspace-preview.utils';

export type PlatformExperienceControlInput = {
  key: PlatformCapabilityKey;
  label: string;
  readinessPct: number;
  governanceReady: boolean;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
};

export type PlatformExperienceInput = {
  controls: PlatformExperienceControlInput[];
  controlsExpected: number;
  brandingCoveragePct: number;
  marketplaceReadinessPct: number;
  extensionGovernancePct: number;
};

@Injectable()
export class PlatformExperienceService {
  previewReadiness(input: PlatformExperienceInput): PlatformExperiencePreview {
    assertPlatformMin('Experience controls expected', input.controlsExpected, 1);
    assertPlatformPercent('Branding coverage pct', input.brandingCoveragePct);
    assertPlatformPercent('Marketplace readiness pct', input.marketplaceReadinessPct);
    assertPlatformPercent('Extension governance pct', input.extensionGovernancePct);

    const controls = input.controls.map((control) => this.buildControl(control));
    const enabledControls = countEnabledControls(controls.map((control) => control.readinessPct));
    const controlCoveragePct = roundPlatformMetric(
      (enabledControls / input.controlsExpected) * 100,
    );
    const readinessPct = averagePlatformReadiness([
      controlCoveragePct,
      input.brandingCoveragePct,
      input.marketplaceReadinessPct,
      input.extensionGovernancePct,
    ]);
    const status = resolvePlatformStatus({
      readinessPct,
      blockers: [enabledControls === 0],
    });
    const nextFocus = this.resolveNextFocus(status);

    return {
      area: 'EXPERIENCE',
      status,
      enabledControls,
      controlsExpected: input.controlsExpected,
      brandingCoveragePct: roundPlatformMetric(input.brandingCoveragePct),
      marketplaceReadinessPct: roundPlatformMetric(input.marketplaceReadinessPct),
      extensionGovernancePct: roundPlatformMetric(input.extensionGovernancePct),
      nextFocus,
      summary: this.buildSummary(status, nextFocus),
      controls,
    };
  }

  private buildControl(input: PlatformExperienceControlInput): PlatformControlSummary {
    assertPlatformPercent(`${input.label} readiness pct`, input.readinessPct);
    assertPlatformMin(`${input.label} route count`, input.routeCount, 1);

    const status = resolvePlatformStatus({
      readinessPct: input.readinessPct,
      blockers: [!input.governanceReady],
    });

    return {
      key: input.key,
      label: input.label,
      status,
      readinessPct: roundPlatformMetric(input.readinessPct),
      routeCount: input.routeCount,
      primaryUseCase: input.primaryUseCase,
      nextFocus: input.nextFocus,
      summary: `${input.label} ${this.describeStatus(status)} for branding, ecosystem, and extension governance. ${input.nextFocus}`,
    };
  }

  private describeStatus(status: PlatformExperiencePreview['status']): string {
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

  private resolveNextFocus(status: PlatformExperiencePreview['status']): string {
    switch (status) {
      case 'BLOCKED':
        return 'Set governance, review, and publishing rules before enabling tenant-facing branding or extensibility.';
      case 'LIMITED':
        return 'Increase branding and extension coverage so marketplace and plugin surfaces stay safe and coherent.';
      case 'FOUNDATION':
        return 'Finish policy and tooling for white label, plugin review, and SDK guidance before wider rollout.';
      case 'READY':
        return 'Open more ecosystem surfaces with tenant-scoped templates and stronger extension quality controls.';
    }
  }

  private buildSummary(status: PlatformExperiencePreview['status'], nextFocus: string): string {
    switch (status) {
      case 'BLOCKED':
        return `Branding and extensibility controls are blocked on governance readiness. ${nextFocus}`;
      case 'LIMITED':
        return `White label, marketplace, and plugin controls exist, but rollout is still narrow. ${nextFocus}`;
      case 'FOUNDATION':
        return `Experience and ecosystem foundation can support staged tenant customization. ${nextFocus}`;
      case 'READY':
        return `Branding and ecosystem controls are ready for broader white label and extension adoption. ${nextFocus}`;
    }
  }
}
