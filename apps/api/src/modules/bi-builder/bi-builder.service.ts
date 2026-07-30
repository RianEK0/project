import { HttpStatus, Injectable } from '@nestjs/common';
import {
  biDashboardLayoutModes,
  biWidgetTypes,
  dashboardTimeWindows,
  selfServeBuilderStatuses,
  type BiDashboardLayoutMode,
  type BiWidgetType,
  type DashboardSignalTone,
  type DashboardTimeWindow,
  type SelfServeBuilderStatus,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type BiWidgetDraft = {
  id?: string;
  type?: string;
  domain?: string;
  metric?: string;
};

type BiDashboardPreviewInput = {
  title?: string;
  layoutMode?: string;
  timeWindow?: string;
  widgets?: BiWidgetDraft[];
};

type BiStarterMetric = {
  domain: string;
  label: string;
  supportedWidgets: readonly BiWidgetType[];
  defaultAggregation: string;
};

type BiDashboardPreviewStat = {
  label: string;
  value: string;
  tone: DashboardSignalTone;
};

type BiDashboardPreviewWidget = {
  id: string;
  title: string;
  type: BiWidgetType;
  domain: string;
  metric: string;
  expectedVisual: string;
  insight: string;
  confidencePct: number;
};

export type BiBuilderFoundation = {
  items: unknown[];
  statuses: readonly SelfServeBuilderStatus[];
  widgetTypes: readonly BiWidgetType[];
  layoutModes: readonly BiDashboardLayoutMode[];
  timeWindows: readonly DashboardTimeWindow[];
  supportedInteractions: string[];
  dataDomains: string[];
  starterMetrics: BiStarterMetric[];
};

export type BiDashboardPreview = {
  title: string;
  status: SelfServeBuilderStatus;
  layoutMode: BiDashboardLayoutMode;
  timeWindow: DashboardTimeWindow;
  widgetCount: number;
  forecastAnchorDate: string;
  filtersApplied: string[];
  narrative: string;
  spotlightStats: BiDashboardPreviewStat[];
  widgets: BiDashboardPreviewWidget[];
  collaborationTargets: string[];
};

const dataDomains = [
  'Inventory',
  'Sales',
  'Purchase',
  'Finance',
  'CRM',
  'HR',
  'Manufacturing',
  'Warehouse',
] as const;

const starterMetrics: BiStarterMetric[] = [
  {
    domain: 'Sales',
    label: 'Revenue trend',
    supportedWidgets: ['CHART', 'GAUGE', 'FORECAST'],
    defaultAggregation: 'SUM',
  },
  {
    domain: 'Purchase',
    label: 'Vendor lead time',
    supportedWidgets: ['HEATMAP', 'TREEMAP', 'CHART'],
    defaultAggregation: 'AVERAGE',
  },
  {
    domain: 'Inventory',
    label: 'Stock aging',
    supportedWidgets: ['HEATMAP', 'TREEMAP', 'PIVOT'],
    defaultAggregation: 'COUNT',
  },
  {
    domain: 'Warehouse',
    label: 'Dispatch readiness',
    supportedWidgets: ['GAUGE', 'MAP', 'CHART'],
    defaultAggregation: 'PERCENTAGE',
  },
  {
    domain: 'Finance',
    label: 'Cash runway',
    supportedWidgets: ['GAUGE', 'FORECAST', 'CHART'],
    defaultAggregation: 'DAYS',
  },
];

@Injectable()
export class BiBuilderService {
  getFoundation(): BiBuilderFoundation {
    return {
      items: [],
      statuses: selfServeBuilderStatuses,
      widgetTypes: biWidgetTypes,
      layoutModes: biDashboardLayoutModes,
      timeWindows: dashboardTimeWindows,
      supportedInteractions: ['DRAG', 'DROP', 'FILTER', 'RESIZE', 'PIN'],
      dataDomains: [...dataDomains],
      starterMetrics,
    };
  }

  preview(input: BiDashboardPreviewInput): BiDashboardPreview {
    const title = input.title?.trim();

    if (!title) {
      throw new AppException(
        ERROR_CODES.BI_BUILDER_INPUT_INVALID,
        'Dashboard title is required for BI preview.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const layoutMode = this.resolveLayoutMode(input.layoutMode);
    const timeWindow = this.resolveTimeWindow(input.timeWindow);
    const widgets = this.resolveWidgets(input.widgets);

    if (widgets.length === 0) {
      throw new AppException(
        ERROR_CODES.BI_BUILDER_INPUT_INVALID,
        'At least one BI widget must be placed on the canvas.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const forecastAnchorDate = widgets.some((widget) => widget.type === 'FORECAST')
      ? '2026-08-31'
      : '2026-07-31';

    return {
      title,
      status: widgets.length >= 3 ? 'READY' : 'REVIEW_NEEDED',
      layoutMode,
      timeWindow,
      widgetCount: widgets.length,
      forecastAnchorDate,
      filtersApplied: [
        'Organization scope locked to active tenant',
        'Timezone normalized to Asia/Jakarta',
        `Window: ${timeWindow.replaceAll('_', ' ')}`,
      ],
      narrative: `Dashboard "${title}" now combines ${widgets.length} widgets across ${this.countDistinctDomains(widgets)} domains, giving business users a self-serve BI surface without leaving the NovaERP analytics workspace.`,
      spotlightStats: this.buildSpotlightStats(widgets),
      widgets,
      collaborationTargets: [
        'Share with finance and operations managers',
        'Publish to executive dashboard workspace',
        'Hand off to analytics governance for metric approval',
      ],
    };
  }

  private resolveLayoutMode(layoutMode?: string): BiDashboardLayoutMode {
    if (!layoutMode) {
      return 'GRID';
    }

    if (!biDashboardLayoutModes.includes(layoutMode as BiDashboardLayoutMode)) {
      throw new AppException(
        ERROR_CODES.BI_BUILDER_INPUT_INVALID,
        `Unsupported BI layout mode: ${layoutMode}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return layoutMode as BiDashboardLayoutMode;
  }

  private resolveTimeWindow(timeWindow?: string): DashboardTimeWindow {
    if (!timeWindow) {
      return 'THIS_MONTH';
    }

    if (!dashboardTimeWindows.includes(timeWindow as DashboardTimeWindow)) {
      throw new AppException(
        ERROR_CODES.BI_BUILDER_INPUT_INVALID,
        `Unsupported BI time window: ${timeWindow}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return timeWindow as DashboardTimeWindow;
  }

  private resolveWidgets(widgets?: BiWidgetDraft[]): BiDashboardPreviewWidget[] {
    return (widgets ?? [])
      .filter((widget): widget is Required<BiWidgetDraft> => {
        return Boolean(
          widget.id?.trim() &&
          widget.type?.trim() &&
          widget.domain?.trim() &&
          widget.metric?.trim(),
        );
      })
      .slice(0, 8)
      .map((widget) => {
        if (!biWidgetTypes.includes(widget.type as BiWidgetType)) {
          throw new AppException(
            ERROR_CODES.BI_BUILDER_INPUT_INVALID,
            `Unsupported BI widget type: ${widget.type}.`,
            HttpStatus.BAD_REQUEST,
          );
        }

        const type = widget.type as BiWidgetType;
        const domain = this.toHeadline(widget.domain);
        const metric = this.toHeadline(widget.metric);

        return {
          id: widget.id,
          title: `${domain} ${metric}`,
          type,
          domain,
          metric,
          expectedVisual: this.resolveVisual(type),
          insight: this.buildInsight(type, domain, metric),
          confidencePct: this.resolveConfidence(type),
        };
      });
  }

  private countDistinctDomains(widgets: BiDashboardPreviewWidget[]) {
    return new Set(widgets.map((widget) => widget.domain)).size;
  }

  private buildSpotlightStats(widgets: BiDashboardPreviewWidget[]): BiDashboardPreviewStat[] {
    return [
      {
        label: 'Widget Mix',
        value: `${widgets.length} active tiles`,
        tone: widgets.length >= 4 ? 'HEALTHY' : 'WATCH',
      },
      {
        label: 'Cross-domain Coverage',
        value: `${this.countDistinctDomains(widgets)} domains`,
        tone: this.countDistinctDomains(widgets) >= 3 ? 'HEALTHY' : 'WATCH',
      },
      {
        label: 'Forecast Readiness',
        value: widgets.some((widget) => widget.type === 'FORECAST')
          ? 'Enabled'
          : 'Add forecast tile',
        tone: widgets.some((widget) => widget.type === 'FORECAST') ? 'HEALTHY' : 'AT_RISK',
      },
    ];
  }

  private resolveVisual(type: BiWidgetType) {
    switch (type) {
      case 'CHART':
        return 'Line or column chart';
      case 'PIVOT':
        return 'Pivot matrix';
      case 'HEATMAP':
        return 'Heatmap intensity grid';
      case 'TREEMAP':
        return 'Treemap hierarchy';
      case 'MAP':
        return 'Geo map with branch overlay';
      case 'GAUGE':
        return 'Gauge KPI dial';
      case 'FORECAST':
        return 'Forecast curve with confidence band';
    }
  }

  private buildInsight(type: BiWidgetType, domain: string, metric: string) {
    switch (type) {
      case 'CHART':
        return `${domain} ${metric} is suited for trend comparison and period-over-period movement.`;
      case 'PIVOT':
        return `${domain} ${metric} can be sliced by branch, company, or owner for deeper drill-down.`;
      case 'HEATMAP':
        return `${domain} ${metric} works well for spotting hotspots, bottlenecks, and dense anomaly clusters.`;
      case 'TREEMAP':
        return `${domain} ${metric} benefits from hierarchical allocation across category, team, or supplier groups.`;
      case 'MAP':
        return `${domain} ${metric} is ready for geographic branch and warehouse overlays.`;
      case 'GAUGE':
        return `${domain} ${metric} can become a leadership KPI with threshold-aware health bands.`;
      case 'FORECAST':
        return `${domain} ${metric} can project the next checkpoint on 2026-08-31 for proactive action planning.`;
    }
  }

  private resolveConfidence(type: BiWidgetType) {
    switch (type) {
      case 'FORECAST':
        return 84;
      case 'MAP':
        return 80;
      case 'TREEMAP':
        return 86;
      default:
        return 91;
    }
  }

  private toHeadline(value: string) {
    return value
      .replaceAll('-', ' ')
      .replaceAll('_', ' ')
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }
}
