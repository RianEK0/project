import { Injectable } from '@nestjs/common';
import { type MobileCapabilityStatus, mobileSurfaceTypes } from '@nova/shared-types';

import {
  assertMobileMetricMin,
  assertMobileMetricRange,
  roundMobileMetric,
} from './mobile-workspace-preview.utils';

export type MobileWarehouseUiInput = {
  scanSuccessRatePct: number;
  averagePickSeconds: number;
  deviceBatteryPct: number;
  gpsCoveragePct: number;
  pushAcknowledgeMinutes: number;
  tabletUtilizationPct: number;
};

export type MobileWarehouseUiPreview = {
  status: MobileCapabilityStatus;
  supportedSurfaces: typeof mobileSurfaceTypes;
  scanSuccessRatePct: number;
  averagePickSeconds: number;
  deviceBatteryPct: number;
  gpsCoveragePct: number;
  pushAcknowledgeMinutes: number;
  tabletUtilizationPct: number;
  nextFocus: string;
  summary: string;
};

@Injectable()
export class MobileWarehouseUiService {
  previewSurface(input: MobileWarehouseUiInput): MobileWarehouseUiPreview {
    assertMobileMetricRange('Scan success rate percentage', input.scanSuccessRatePct, 0, 100);
    assertMobileMetricMin('Average pick seconds', input.averagePickSeconds);
    assertMobileMetricRange('Device battery percentage', input.deviceBatteryPct, 0, 100);
    assertMobileMetricRange('GPS coverage percentage', input.gpsCoveragePct, 0, 100);
    assertMobileMetricMin('Push acknowledge minutes', input.pushAcknowledgeMinutes);
    assertMobileMetricRange('Tablet utilization percentage', input.tabletUtilizationPct, 0, 100);

    const status = this.resolveStatus(input);
    const nextFocus = this.resolveNextFocus(status);

    return {
      status,
      supportedSurfaces: mobileSurfaceTypes,
      scanSuccessRatePct: roundMobileMetric(input.scanSuccessRatePct),
      averagePickSeconds: roundMobileMetric(input.averagePickSeconds),
      deviceBatteryPct: roundMobileMetric(input.deviceBatteryPct),
      gpsCoveragePct: roundMobileMetric(input.gpsCoveragePct),
      pushAcknowledgeMinutes: roundMobileMetric(input.pushAcknowledgeMinutes),
      tabletUtilizationPct: roundMobileMetric(input.tabletUtilizationPct),
      nextFocus,
      summary: this.buildSummary(status, nextFocus),
    };
  }

  private resolveStatus(input: MobileWarehouseUiInput): MobileCapabilityStatus {
    if (input.deviceBatteryPct < 20 || input.scanSuccessRatePct < 85) {
      return 'BLOCKED';
    }
    if (
      input.gpsCoveragePct < 70 ||
      input.pushAcknowledgeMinutes > 15 ||
      input.scanSuccessRatePct < 92
    ) {
      return 'LIMITED';
    }
    if (input.tabletUtilizationPct < 60 || input.averagePickSeconds > 75) {
      return 'FOUNDATION';
    }

    return 'READY';
  }

  private resolveNextFocus(status: MobileCapabilityStatus): string {
    switch (status) {
      case 'BLOCKED':
        return 'Recover battery and scan reliability before the next handheld session.';
      case 'LIMITED':
        return 'Improve GPS and acknowledgement consistency across device shifts.';
      case 'FOUNDATION':
        return 'Push adoption on tablet and touch surfaces until throughput stabilizes.';
      case 'READY':
        return 'Scale the touch workflow to more warehouse lanes and supervisors.';
    }
  }

  private buildSummary(status: MobileCapabilityStatus, nextFocus: string): string {
    switch (status) {
      case 'BLOCKED':
        return `Warehouse mobile execution is not yet stable enough for broader rollout. ${nextFocus}`;
      case 'LIMITED':
        return `Warehouse mobile execution works, but still has field reliability gaps. ${nextFocus}`;
      case 'FOUNDATION':
        return `Warehouse mobile execution is in place and needs adoption and layout polish. ${nextFocus}`;
      case 'READY':
        return `Warehouse mobile execution is ready for wider tablet and handheld usage. ${nextFocus}`;
    }
  }
}
