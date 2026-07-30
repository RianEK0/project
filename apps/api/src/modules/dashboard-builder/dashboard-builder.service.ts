import { HttpStatus, Injectable } from '@nestjs/common';
import {
  dashboardAudiences,
  dashboardBuilderLayoutModes,
  dashboardBuilderRefreshCadences,
  dashboardBuilderWidgetTypes,
  dashboardSignalTones,
  selfServeBuilderStatuses,
  type DashboardAudience,
  type DashboardBuilderLayoutMode,
  type DashboardBuilderRefreshCadence,
  type DashboardBuilderWidgetType,
  type DashboardSignalTone,
  type SelfServeBuilderStatus,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type DashboardWidgetDraft = {
  id?: string;
  type?: string;
  slot?: string;
  title?: string;
};

type DashboardBuilderPreviewInput = {
  dashboardName?: string;
  audience?: string;
  layoutMode?: string;
  refreshCadence?: string;
  widgets?: DashboardWidgetDraft[];
};

type DashboardStarterWidget = {
  title: string;
  type: DashboardBuilderWidgetType;
  suggestedAudience: DashboardAudience;
};

type DashboardPreviewWidget = {
  id: string;
  title: string;
  type: DashboardBuilderWidgetType;
  slot: string;
  signalTone: DashboardSignalTone;
  insight: string;
};

export type DashboardBuilderFoundation = {
  items: unknown[];
  statuses: readonly SelfServeBuilderStatus[];
  widgetTypes: readonly DashboardBuilderWidgetType[];
  layoutModes: readonly DashboardBuilderLayoutMode[];
  refreshCadences: readonly DashboardBuilderRefreshCadence[];
  audiences: readonly DashboardAudience[];
  supportedSlots: string[];
  starterWidgets: DashboardStarterWidget[];
  signalTones: readonly DashboardSignalTone[];
};

export type DashboardBuilderPreview = {
  dashboardName: string;
  audience: DashboardAudience;
  layoutMode: DashboardBuilderLayoutMode;
  refreshCadence: DashboardBuilderRefreshCadence;
  status: SelfServeBuilderStatus;
  widgetCount: number;
  nextPublishDate: string;
  summary: string;
  shareTargets: string[];
  operationalFocus: string[];
  guardrails: string[];
  widgets: DashboardPreviewWidget[];
};

const supportedSlots = ['Hero', 'Top Row', 'Mid Row', 'Bottom Row'] as const;

@Injectable()
export class DashboardBuilderService {
  getFoundation(): DashboardBuilderFoundation {
    return {
      items: [],
      statuses: selfServeBuilderStatuses,
      widgetTypes: dashboardBuilderWidgetTypes,
      layoutModes: dashboardBuilderLayoutModes,
      refreshCadences: dashboardBuilderRefreshCadences,
      audiences: dashboardAudiences,
      supportedSlots: [...supportedSlots],
      starterWidgets: [
        { title: 'Executive Metric', type: 'METRIC', suggestedAudience: 'EXECUTIVE' },
        { title: 'Ops Kanban', type: 'KANBAN', suggestedAudience: 'WAREHOUSE' },
        { title: 'Revenue Chart', type: 'CHART', suggestedAudience: 'FINANCE' },
        { title: 'Service Calendar', type: 'CALENDAR', suggestedAudience: 'CRM' },
      ],
      signalTones: dashboardSignalTones,
    };
  }

  preview(input: DashboardBuilderPreviewInput): DashboardBuilderPreview {
    const dashboardName = input.dashboardName?.trim();

    if (!dashboardName) {
      throw new AppException(
        ERROR_CODES.DASHBOARD_BUILDER_INPUT_INVALID,
        'Dashboard name is required for dashboard builder preview.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const audience = this.resolveAudience(input.audience);
    const layoutMode = this.resolveLayoutMode(input.layoutMode);
    const refreshCadence = this.resolveRefreshCadence(input.refreshCadence);
    const widgets = this.resolveWidgets(input.widgets);

    if (widgets.length === 0) {
      throw new AppException(
        ERROR_CODES.DASHBOARD_BUILDER_INPUT_INVALID,
        'At least one widget must be placed on the dashboard canvas.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      dashboardName,
      audience,
      layoutMode,
      refreshCadence,
      status: widgets.length >= 3 ? 'READY' : 'REVIEW_NEEDED',
      widgetCount: widgets.length,
      nextPublishDate: '2026-07-28',
      summary: `Dashboard "${dashboardName}" now combines ${widgets.length} user-arranged widgets for the ${audience.toLowerCase()} audience, giving teams a self-serve operational board beyond the fixed executive scorecards.`,
      shareTargets: [
        'Share to dashboard workspace',
        'Pin into executive review rotation',
        'Embed into low-code app surfaces',
      ],
      operationalFocus: [
        'Fast cross-team situational awareness',
        'Role-specific metric and backlog visibility',
        'Governed publish path for tenant-wide dashboards',
      ],
      guardrails: [
        'Widget data remains tenant-scoped and route-safe.',
        'Live refresh should be limited to approved high-signal boards.',
        'Operational kanban and calendar widgets should avoid bypassing source-of-truth workflows.',
      ],
      widgets,
    };
  }

  private resolveAudience(audience?: string): DashboardAudience {
    if (!audience) {
      return 'EXECUTIVE';
    }

    if (!dashboardAudiences.includes(audience as DashboardAudience)) {
      throw new AppException(
        ERROR_CODES.DASHBOARD_BUILDER_INPUT_INVALID,
        `Unsupported dashboard audience: ${audience}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return audience as DashboardAudience;
  }

  private resolveLayoutMode(layoutMode?: string): DashboardBuilderLayoutMode {
    if (!layoutMode) {
      return 'GRID';
    }

    if (!dashboardBuilderLayoutModes.includes(layoutMode as DashboardBuilderLayoutMode)) {
      throw new AppException(
        ERROR_CODES.DASHBOARD_BUILDER_INPUT_INVALID,
        `Unsupported dashboard layout mode: ${layoutMode}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return layoutMode as DashboardBuilderLayoutMode;
  }

  private resolveRefreshCadence(refreshCadence?: string): DashboardBuilderRefreshCadence {
    if (!refreshCadence) {
      return 'HOURLY';
    }

    if (
      !dashboardBuilderRefreshCadences.includes(refreshCadence as DashboardBuilderRefreshCadence)
    ) {
      throw new AppException(
        ERROR_CODES.DASHBOARD_BUILDER_INPUT_INVALID,
        `Unsupported dashboard refresh cadence: ${refreshCadence}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return refreshCadence as DashboardBuilderRefreshCadence;
  }

  private resolveWidgets(widgets?: DashboardWidgetDraft[]): DashboardPreviewWidget[] {
    return (widgets ?? [])
      .filter((widget): widget is Required<DashboardWidgetDraft> => {
        return Boolean(
          widget.id?.trim() && widget.type?.trim() && widget.slot?.trim() && widget.title?.trim(),
        );
      })
      .slice(0, 10)
      .map((widget) => {
        if (!dashboardBuilderWidgetTypes.includes(widget.type as DashboardBuilderWidgetType)) {
          throw new AppException(
            ERROR_CODES.DASHBOARD_BUILDER_INPUT_INVALID,
            `Unsupported dashboard widget type: ${widget.type}.`,
            HttpStatus.BAD_REQUEST,
          );
        }

        const type = widget.type as DashboardBuilderWidgetType;

        return {
          id: widget.id,
          title: widget.title.trim(),
          type,
          slot: widget.slot.trim(),
          signalTone: this.resolveTone(type),
          insight: this.resolveInsight(type),
        };
      });
  }

  private resolveTone(type: DashboardBuilderWidgetType): DashboardSignalTone {
    switch (type) {
      case 'GAUGE':
      case 'METRIC':
        return 'HEALTHY';
      case 'KANBAN':
      case 'TIMELINE':
        return 'WATCH';
      case 'MAP':
        return 'AT_RISK';
      default:
        return 'WATCH';
    }
  }

  private resolveInsight(type: DashboardBuilderWidgetType) {
    switch (type) {
      case 'CHART':
        return 'Trend widget for period movement and target variance.';
      case 'METRIC':
        return 'Single-value KPI block for leadership scanning.';
      case 'CARD':
        return 'Narrative card for decisions, blockers, or important alerts.';
      case 'GAUGE':
        return 'Threshold-aware gauge for quick health checks.';
      case 'MAP':
        return 'Geographic visibility for branches, routes, or warehouses.';
      case 'TIMELINE':
        return 'Chronological lane for milestones and deadlines.';
      case 'CALENDAR':
        return 'Time-grid visibility for bookings, due dates, or workloads.';
      case 'KANBAN':
        return 'Stage-based work board for approvals or operational queues.';
    }
  }
}
