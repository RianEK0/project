import { Injectable } from '@nestjs/common';
import { type PlatformCapabilityKey } from '@nova/shared-types';

import {
  type PlatformControlSummary,
  type PlatformIdentityPreview,
} from './platform-workspace.types';
import {
  assertPlatformMin,
  assertPlatformPercent,
  averagePlatformReadiness,
  countEnabledControls,
  resolvePlatformStatus,
  roundPlatformMetric,
} from './platform-workspace-preview.utils';

export type PlatformIdentityControlInput = {
  key: PlatformCapabilityKey;
  label: string;
  readinessPct: number;
  federationReady: boolean;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
};

export type PlatformIdentityInput = {
  controls: PlatformIdentityControlInput[];
  controlsExpected: number;
  auditCoveragePct: number;
  complianceCoveragePct: number;
  federationCoveragePct: number;
};

@Injectable()
export class PlatformIdentityService {
  previewReadiness(input: PlatformIdentityInput): PlatformIdentityPreview {
    assertPlatformMin('Identity controls expected', input.controlsExpected, 1);
    assertPlatformPercent('Audit coverage pct', input.auditCoveragePct);
    assertPlatformPercent('Compliance coverage pct', input.complianceCoveragePct);
    assertPlatformPercent('Federation coverage pct', input.federationCoveragePct);

    const controls = input.controls.map((control) => this.buildControl(control));
    const enabledControls = countEnabledControls(controls.map((control) => control.readinessPct));
    const controlCoveragePct = roundPlatformMetric(
      (enabledControls / input.controlsExpected) * 100,
    );
    const readinessPct = averagePlatformReadiness([
      controlCoveragePct,
      input.auditCoveragePct,
      input.complianceCoveragePct,
      input.federationCoveragePct,
    ]);
    const status = resolvePlatformStatus({
      readinessPct,
      blockers: [enabledControls === 0],
    });
    const nextFocus = this.resolveNextFocus(status);

    return {
      area: 'IDENTITY_TRUST',
      status,
      enabledControls,
      controlsExpected: input.controlsExpected,
      auditCoveragePct: roundPlatformMetric(input.auditCoveragePct),
      complianceCoveragePct: roundPlatformMetric(input.complianceCoveragePct),
      federationCoveragePct: roundPlatformMetric(input.federationCoveragePct),
      nextFocus,
      summary: this.buildSummary(status, nextFocus),
      controls,
    };
  }

  private buildControl(input: PlatformIdentityControlInput): PlatformControlSummary {
    assertPlatformPercent(`${input.label} readiness pct`, input.readinessPct);
    assertPlatformMin(`${input.label} route count`, input.routeCount, 1);

    const status = resolvePlatformStatus({
      readinessPct: input.readinessPct,
      blockers: [!input.federationReady],
    });

    return {
      key: input.key,
      label: input.label,
      status,
      readinessPct: roundPlatformMetric(input.readinessPct),
      routeCount: input.routeCount,
      primaryUseCase: input.primaryUseCase,
      nextFocus: input.nextFocus,
      summary: `${input.label} ${this.describeStatus(status)} for auditability, compliance posture, and enterprise identity federation. ${input.nextFocus}`,
    };
  }

  private describeStatus(status: PlatformIdentityPreview['status']): string {
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

  private resolveNextFocus(status: PlatformIdentityPreview['status']): string {
    switch (status) {
      case 'BLOCKED':
        return 'Close federation, audit retention, and compliance policy prerequisites before enabling enterprise identity controls.';
      case 'LIMITED':
        return 'Increase audit, compliance, and federation coverage so SSO can support larger tenants safely.';
      case 'FOUNDATION':
        return 'Finish OAuth, SAML, and compliance control mapping before scaling beyond pilot enterprise accounts.';
      case 'READY':
        return 'Roll out enterprise trust controls more broadly with policy templates and federated onboarding playbooks.';
    }
  }

  private buildSummary(status: PlatformIdentityPreview['status'], nextFocus: string): string {
    switch (status) {
      case 'BLOCKED':
        return `Identity and trust controls are blocked on federation or compliance prerequisites. ${nextFocus}`;
      case 'LIMITED':
        return `Audit center, compliance, and SSO visibility exists, but enterprise trust coverage is still uneven. ${nextFocus}`;
      case 'FOUNDATION':
        return `Identity and trust foundation can already support staged enterprise federation rollout. ${nextFocus}`;
      case 'READY':
        return `Identity and trust controls are ready for broader enterprise adoption across federated tenants. ${nextFocus}`;
    }
  }
}
