import { Injectable } from '@nestjs/common';
import { type MobileCapabilityStatus } from '@nova/shared-types';

import {
  assertMobileMetricMin,
  roundMobileMetric,
  toMobilePercent,
} from './mobile-workspace-preview.utils';

export type MobilePwaReadinessInput = {
  coreScreens: number;
  offlineReadyScreens: number;
  expectedShortcuts: number;
  configuredShortcuts: number;
  manifestEnabled: boolean;
  serviceWorkerEnabled: boolean;
  pushEnabled: boolean;
};

export type MobilePwaReadinessPreview = {
  status: MobileCapabilityStatus;
  installable: boolean;
  manifestEnabled: boolean;
  serviceWorkerEnabled: boolean;
  pushEnabled: boolean;
  offlineCoveragePct: number;
  shortcutCoveragePct: number;
  nextFocus: string;
  summary: string;
};

@Injectable()
export class MobilePwaReadinessService {
  previewReadiness(input: MobilePwaReadinessInput): MobilePwaReadinessPreview {
    assertMobileMetricMin('Core screens', input.coreScreens, 1);
    assertMobileMetricMin('Offline-ready screens', input.offlineReadyScreens);
    assertMobileMetricMin('Expected shortcuts', input.expectedShortcuts, 1);
    assertMobileMetricMin('Configured shortcuts', input.configuredShortcuts);

    const offlineCoveragePct = toMobilePercent(input.offlineReadyScreens, input.coreScreens);
    const shortcutCoveragePct = toMobilePercent(input.configuredShortcuts, input.expectedShortcuts);
    const status = this.resolveStatus({
      manifestEnabled: input.manifestEnabled,
      serviceWorkerEnabled: input.serviceWorkerEnabled,
      offlineCoveragePct,
      shortcutCoveragePct,
      pushEnabled: input.pushEnabled,
    });
    const nextFocus = this.resolveNextFocus(status);

    return {
      status,
      installable: input.manifestEnabled && input.serviceWorkerEnabled,
      manifestEnabled: input.manifestEnabled,
      serviceWorkerEnabled: input.serviceWorkerEnabled,
      pushEnabled: input.pushEnabled,
      offlineCoveragePct: roundMobileMetric(offlineCoveragePct),
      shortcutCoveragePct: roundMobileMetric(shortcutCoveragePct),
      nextFocus,
      summary: this.buildSummary(status, nextFocus),
    };
  }

  private resolveStatus(input: {
    manifestEnabled: boolean;
    serviceWorkerEnabled: boolean;
    offlineCoveragePct: number;
    shortcutCoveragePct: number;
    pushEnabled: boolean;
  }): MobileCapabilityStatus {
    if (!input.manifestEnabled || !input.serviceWorkerEnabled) {
      return 'BLOCKED';
    }
    if (input.offlineCoveragePct < 50 || input.shortcutCoveragePct < 50) {
      return 'LIMITED';
    }
    if (!input.pushEnabled || input.offlineCoveragePct < 100) {
      return 'FOUNDATION';
    }

    return 'READY';
  }

  private resolveNextFocus(status: MobileCapabilityStatus): string {
    switch (status) {
      case 'BLOCKED':
        return 'Enable the manifest and service worker pair first.';
      case 'LIMITED':
        return 'Expand offline-ready routes and shortcut coverage.';
      case 'FOUNDATION':
        return 'Close the last install and push gaps before scaling mobile adoption.';
      case 'READY':
        return 'Promote install and usage across operational teams.';
    }
  }

  private buildSummary(status: MobileCapabilityStatus, nextFocus: string): string {
    switch (status) {
      case 'BLOCKED':
        return `PWA delivery is not yet installable. ${nextFocus}`;
      case 'LIMITED':
        return `PWA delivery exists, but coverage is still narrow for real field execution. ${nextFocus}`;
      case 'FOUNDATION':
        return `PWA foundation is usable and only needs coverage polish. ${nextFocus}`;
      case 'READY':
        return `PWA foundation is ready for broader warehouse and tablet rollout. ${nextFocus}`;
    }
  }
}
