import { Injectable } from '@nestjs/common';
import { type OfflineSyncStatus } from '@nova/shared-types';

import {
  assertMobileMetricMin,
  assertMobileMetricRange,
  roundMobileMetric,
} from './mobile-workspace-preview.utils';

export type MobileOfflineSyncInput = {
  pendingOperations: number;
  conflictCount: number;
  oldestPendingMinutes: number;
  replaySuccessRatePct: number;
  lowBatteryModeEnabled: boolean;
};

export type MobileOfflineSyncPreview = {
  status: OfflineSyncStatus;
  queueDepth: number;
  conflictCount: number;
  oldestPendingMinutes: number;
  replaySuccessRatePct: number;
  syncPressure: 'LOW' | 'MEDIUM' | 'HIGH';
  nextFocus: string;
  summary: string;
};

@Injectable()
export class MobileOfflineSyncService {
  previewSync(input: MobileOfflineSyncInput): MobileOfflineSyncPreview {
    assertMobileMetricMin('Pending operations', input.pendingOperations);
    assertMobileMetricMin('Conflict count', input.conflictCount);
    assertMobileMetricMin('Oldest pending minutes', input.oldestPendingMinutes);
    assertMobileMetricRange('Replay success rate percentage', input.replaySuccessRatePct, 0, 100);

    const status = this.resolveStatus(input);
    const syncPressure = this.resolvePressure(input);
    const nextFocus = this.resolveNextFocus(status, syncPressure);

    return {
      status,
      queueDepth: roundMobileMetric(input.pendingOperations, 0),
      conflictCount: roundMobileMetric(input.conflictCount, 0),
      oldestPendingMinutes: roundMobileMetric(input.oldestPendingMinutes, 0),
      replaySuccessRatePct: roundMobileMetric(input.replaySuccessRatePct),
      syncPressure,
      nextFocus,
      summary: this.buildSummary(status, nextFocus),
    };
  }

  private resolveStatus(input: MobileOfflineSyncInput): OfflineSyncStatus {
    if (input.conflictCount > 0) {
      return 'CONFLICT';
    }
    if (input.pendingOperations === 0) {
      return 'ONLINE';
    }
    if (
      input.replaySuccessRatePct >= 92 &&
      input.oldestPendingMinutes < 15 &&
      !input.lowBatteryModeEnabled
    ) {
      return 'SYNCING';
    }

    return 'OFFLINE_BUFFERING';
  }

  private resolvePressure(input: MobileOfflineSyncInput): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (
      input.conflictCount > 0 ||
      input.pendingOperations > 100 ||
      input.oldestPendingMinutes > 60
    ) {
      return 'HIGH';
    }
    if (input.pendingOperations > 25 || input.oldestPendingMinutes > 15) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  private resolveNextFocus(
    status: OfflineSyncStatus,
    syncPressure: 'LOW' | 'MEDIUM' | 'HIGH',
  ): string {
    if (status === 'CONFLICT') {
      return 'Resolve field conflicts before replaying more mutations.';
    }
    if (status === 'ONLINE') {
      return 'Keep the queue empty and preserve fast replay behavior.';
    }
    if (syncPressure === 'HIGH') {
      return 'Drain the queue and reduce mutation age before the next warehouse shift.';
    }
    if (status === 'SYNCING') {
      return 'Let replay finish while monitoring conflict risk.';
    }

    return 'Stabilize buffering and keep replay success above the target threshold.';
  }

  private buildSummary(status: OfflineSyncStatus, nextFocus: string): string {
    switch (status) {
      case 'CONFLICT':
        return `Offline sync is blocked by merge or replay conflicts. ${nextFocus}`;
      case 'ONLINE':
        return `Offline sync is fully caught up. ${nextFocus}`;
      case 'SYNCING':
        return `Offline sync is replaying normally. ${nextFocus}`;
      case 'OFFLINE_BUFFERING':
        return `Offline sync is buffering changes and needs queue discipline. ${nextFocus}`;
    }
  }
}
