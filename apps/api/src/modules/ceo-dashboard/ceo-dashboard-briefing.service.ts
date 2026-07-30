import { Injectable } from '@nestjs/common';
import {
  type DashboardAudience,
  type DashboardSignalTone,
  type DashboardTimeWindow,
} from '@nova/shared-types';

import {
  assertDashboardMetricMin,
  assertDashboardMetricRange,
  roundDashboardMetric,
  selectDashboardSignal,
} from '../../common/utils/dashboard-preview.utils';

export type CeoDashboardBriefingInput = {
  netRevenueRunRate: number;
  pipelineCoverageRatio: number;
  liquidityRatio: number;
  strategicInitiativesOnTrackPct: number;
  blockedEscalations: number;
};

export type CeoDashboardBriefing = {
  audience: Extract<DashboardAudience, 'CEO'>;
  window: Extract<DashboardTimeWindow, 'THIS_QUARTER'>;
  summarySignal: DashboardSignalTone;
  topFocus: string;
  actionBias: string;
  boardSummary: string;
  briefingPoints: string[];
};

@Injectable()
export class CeoDashboardBriefingService {
  previewBriefing(input: CeoDashboardBriefingInput): CeoDashboardBriefing {
    assertDashboardMetricMin('Net revenue run rate', input.netRevenueRunRate);
    assertDashboardMetricRange('Pipeline coverage ratio', input.pipelineCoverageRatio, 0, 10);
    assertDashboardMetricRange('Liquidity ratio', input.liquidityRatio, 0, 10);
    assertDashboardMetricRange(
      'Strategic initiatives on-track percentage',
      input.strategicInitiativesOnTrackPct,
      0,
      100,
    );
    assertDashboardMetricMin('Blocked escalations', input.blockedEscalations);

    const revenueTone =
      input.netRevenueRunRate < 750_000
        ? 'AT_RISK'
        : input.netRevenueRunRate < 1_250_000
          ? 'WATCH'
          : 'HEALTHY';
    const pipelineTone =
      input.pipelineCoverageRatio < 1.5
        ? 'AT_RISK'
        : input.pipelineCoverageRatio < 2
          ? 'WATCH'
          : 'HEALTHY';
    const liquidityTone =
      input.liquidityRatio < 1
        ? 'CRITICAL'
        : input.liquidityRatio < 1.2
          ? 'AT_RISK'
          : input.liquidityRatio < 1.5
            ? 'WATCH'
            : 'HEALTHY';
    const initiativesTone =
      input.strategicInitiativesOnTrackPct < 65
        ? 'AT_RISK'
        : input.strategicInitiativesOnTrackPct < 80
          ? 'WATCH'
          : 'HEALTHY';
    const escalationTone =
      input.blockedEscalations > 8
        ? 'CRITICAL'
        : input.blockedEscalations > 4
          ? 'AT_RISK'
          : input.blockedEscalations > 1
            ? 'WATCH'
            : 'HEALTHY';

    const summarySignal = selectDashboardSignal(
      revenueTone,
      pipelineTone,
      liquidityTone,
      initiativesTone,
      escalationTone,
    );
    const topFocus = this.resolveTopFocus({
      revenueTone,
      pipelineTone,
      liquidityTone,
      initiativesTone,
      escalationTone,
    });

    return {
      audience: 'CEO',
      window: 'THIS_QUARTER',
      summarySignal,
      topFocus,
      actionBias: this.resolveActionBias(topFocus),
      boardSummary: this.buildBoardSummary(summarySignal, topFocus),
      briefingPoints: [
        `Net revenue run-rate sits at ${roundDashboardMetric(input.netRevenueRunRate, 0)}.`,
        `Pipeline coverage is ${roundDashboardMetric(input.pipelineCoverageRatio)}x with ${roundDashboardMetric(input.strategicInitiativesOnTrackPct)}% of strategic initiatives on track.`,
        `Liquidity is ${roundDashboardMetric(input.liquidityRatio)}x with ${input.blockedEscalations} blocked executive escalations.`,
      ],
    };
  }

  private resolveTopFocus(input: {
    revenueTone: DashboardSignalTone;
    pipelineTone: DashboardSignalTone;
    liquidityTone: DashboardSignalTone;
    initiativesTone: DashboardSignalTone;
    escalationTone: DashboardSignalTone;
  }): string {
    if (input.liquidityTone === 'CRITICAL' || input.liquidityTone === 'AT_RISK') {
      return 'Liquidity and cash protection';
    }
    if (input.escalationTone === 'CRITICAL' || input.escalationTone === 'AT_RISK') {
      return 'Escalation clearance';
    }
    if (input.pipelineTone === 'AT_RISK') {
      return 'Pipeline coverage';
    }
    if (input.initiativesTone === 'AT_RISK') {
      return 'Strategic initiative delivery';
    }
    if (input.revenueTone !== 'HEALTHY') {
      return 'Revenue run-rate stability';
    }

    return 'Portfolio momentum';
  }

  private resolveActionBias(topFocus: string): string {
    switch (topFocus) {
      case 'Liquidity and cash protection':
        return 'Protect cash and tighten executive spend gates.';
      case 'Escalation clearance':
        return 'Remove blockers and restore cross-functional decision velocity.';
      case 'Pipeline coverage':
        return 'Accelerate commercial coverage before the quarter narrows.';
      case 'Strategic initiative delivery':
        return 'Re-sequence initiatives toward the few with direct quarterly impact.';
      case 'Revenue run-rate stability':
        return 'Stabilize topline momentum while keeping delivery quality intact.';
      default:
        return 'Maintain current pacing and preserve optionality for the next planning cycle.';
    }
  }

  private buildBoardSummary(signal: DashboardSignalTone, topFocus: string): string {
    switch (signal) {
      case 'CRITICAL':
        return `Board-level attention is needed around ${topFocus} this quarter.`;
      case 'AT_RISK':
        return `${topFocus} is becoming the primary drag on quarterly execution.`;
      case 'WATCH':
        return `${topFocus} should stay on the weekly CEO agenda while momentum holds elsewhere.`;
      case 'HEALTHY':
        return 'Quarterly momentum is balanced across revenue, liquidity, initiatives, and escalation load.';
    }
  }
}
