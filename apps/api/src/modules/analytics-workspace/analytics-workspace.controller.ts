import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  analyticsWorkspaceAreas,
  analyticsWorkspaceCapabilityKeys,
  analyticsWorkspaceCapabilityStatuses,
} from '@nova/shared-types';

import { AnalyticsDomainOperationsService } from './analytics-domain-operations.service';
import { AnalyticsEntityIntelligenceService } from './analytics-entity-intelligence.service';
import { AnalyticsRealtimeService } from './analytics-realtime.service';
import { AnalyticsSemanticModelService } from './analytics-semantic-model.service';

@ApiTags('Analytics Workspace')
@Controller({
  path: 'analytics-workspace',
  version: '1',
})
export class AnalyticsWorkspaceController {
  constructor(
    private readonly analyticsDomainOperationsService: AnalyticsDomainOperationsService,
    private readonly analyticsEntityIntelligenceService: AnalyticsEntityIntelligenceService,
    private readonly analyticsSemanticModelService: AnalyticsSemanticModelService,
    private readonly analyticsRealtimeService: AnalyticsRealtimeService,
  ) {}

  @Get()
  getWorkspace() {
    return {
      capabilities: analyticsWorkspaceCapabilityKeys,
      areas: analyticsWorkspaceAreas,
      statuses: analyticsWorkspaceCapabilityStatuses,
      cards: [
        {
          id: 'domain-operations',
          label: 'Domain Operations',
          route: '/app/analytics/inventory',
          description:
            'Inventory, sales, purchase, accounting, HR, manufacturing, booking, and CRM analytics lanes in one BI workspace.',
        },
        {
          id: 'entity-intelligence',
          label: 'Entity Intelligence',
          route: '/app/analytics/customer',
          description:
            'Customer, supplier, and warehouse entity analytics for 360 views and master-driven decisions.',
        },
        {
          id: 'semantic-model',
          label: 'Semantic Model',
          route: '/app/analytics/fact-table',
          description:
            'Fact tables, dimensions, OLAP, and cubes as the governed modeling surface behind NovaERP BI.',
        },
        {
          id: 'realtime',
          label: 'Realtime',
          route: '/app/analytics/realtime-analytics',
          description:
            'Realtime analytics lane for freshness-sensitive monitoring and action routing.',
        },
      ],
      relatedRoutes: [
        { label: 'BI Builder', route: '/app/analytics/bi-builder' },
        { label: 'Report Builder', route: '/app/analytics/report-builder' },
        { label: 'Dashboards', route: '/app/dashboards' },
        { label: 'Sales analytics', route: '/app/sales/analytics' },
        { label: 'Procurement analytics', route: '/app/procurement/analytics' },
        { label: 'Warehouse reports', route: '/app/warehouse-operations/reports' },
        { label: 'AI analytics', route: '/app/ai/analytics' },
        { label: 'Finance statements', route: '/app/finance/financial-statements' },
      ],
    };
  }

  @Get('operations-preview')
  getOperationsPreview() {
    return this.analyticsDomainOperationsService.previewReadiness({
      capabilitiesExpected: 8,
      domainCoveragePct: 85,
      dashboardAlignmentPct: 81,
      crossProcessCoveragePct: 79,
      capabilities: [
        {
          key: 'INVENTORY_ANALYTICS',
          label: 'Inventory Analytics',
          readinessPct: 84,
          martReady: true,
          routeCount: 3,
          primaryUseCase:
            'Track stock health, replenishment pressure, and inventory exposure with one mart-ready lane.',
          nextFocus:
            'Broaden inventory aging and lot-sensitive metrics for procurement and warehouse managers.',
        },
        {
          key: 'SALES_ANALYTICS',
          label: 'Sales Analytics',
          readinessPct: 88,
          martReady: true,
          routeCount: 3,
          primaryUseCase:
            'Read order-to-cash, invoicing, return, and collection momentum from one commercial mart.',
          nextFocus:
            'Add gross-margin and cohort drill-downs before opening wider self-serve sales BI.',
        },
        {
          key: 'PURCHASE_ANALYTICS',
          label: 'Purchase Analytics',
          readinessPct: 82,
          martReady: true,
          routeCount: 3,
          primaryUseCase:
            'Follow request, RFQ, order, and invoice-prep progress through a sourcing analytics lane.',
          nextFocus:
            'Improve landed-cost, vendor mix, and lead-time rollups for deeper procurement review.',
        },
        {
          key: 'ACCOUNTING_ANALYTICS',
          label: 'Accounting Analytics',
          readinessPct: 77,
          martReady: true,
          routeCount: 3,
          primaryUseCase:
            'Surface close discipline, journal movement, and statement-driven accounting signals.',
          nextFocus:
            'Strengthen close calendar and variance storylines before scaling accounting BI adoption.',
        },
        {
          key: 'HR_ANALYTICS',
          label: 'HR Analytics',
          readinessPct: 75,
          martReady: true,
          routeCount: 3,
          primaryUseCase:
            'Read attendance, recruitment, performance, and training signals in one people-ops lane.',
          nextFocus:
            'Expand workforce planning and retention signal modeling beyond starter scorecards.',
        },
        {
          key: 'MANUFACTURING_ANALYTICS',
          label: 'Manufacturing Analytics',
          readinessPct: 80,
          martReady: true,
          routeCount: 3,
          primaryUseCase:
            'Watch throughput, shortage, yield, and capacity movement across production analytics.',
          nextFocus: 'Add more waste, downtime, and work-center comparative drill paths.',
        },
        {
          key: 'BOOKING_ANALYTICS',
          label: 'Booking Analytics',
          readinessPct: 73,
          martReady: true,
          routeCount: 3,
          primaryUseCase:
            'Track booking demand, utilization, cancellation, and payment completion through one mart.',
          nextFocus:
            'Expand booking segmentation by channel, service, and resource utilization patterns.',
        },
        {
          key: 'CRM_ANALYTICS',
          label: 'CRM Analytics',
          readinessPct: 78,
          martReady: true,
          routeCount: 3,
          primaryUseCase:
            'Follow lead creation, pipeline quality, quotation load, and weighted revenue movement.',
          nextFocus:
            'Improve commercial stage-conversion and stalled-opportunity analytics for managers while feeding self-serve BI boards.',
        },
      ],
    });
  }

  @Get('entity-preview')
  getEntityPreview() {
    return this.analyticsEntityIntelligenceService.previewReadiness({
      capabilitiesExpected: 3,
      customerCoveragePct: 83,
      supplierCoveragePct: 78,
      warehouseCoveragePct: 86,
      capabilities: [
        {
          key: 'CUSTOMER_ANALYTICS',
          label: 'Customer Analytics',
          readinessPct: 82,
          entityReady: true,
          routeCount: 3,
          primaryUseCase:
            'Unify booking, sales, invoice, and support context into customer-level BI review.',
          nextFocus: 'Expand health, retention, and receivable-linked customer cohort analysis.',
        },
        {
          key: 'SUPPLIER_ANALYTICS',
          label: 'Supplier Analytics',
          readinessPct: 77,
          entityReady: true,
          routeCount: 3,
          primaryUseCase:
            'Track vendor responsiveness, dependency, lead time, and sourcing exposure by supplier.',
          nextFocus: 'Strengthen cross-product vendor contribution and fallback supplier views.',
        },
        {
          key: 'WAREHOUSE_ANALYTICS',
          label: 'Warehouse Analytics',
          readinessPct: 84,
          entityReady: true,
          routeCount: 3,
          primaryUseCase:
            'Compare throughput, backlog, and stock control behavior across warehouse entities.',
          nextFocus: 'Add inter-warehouse benchmarking and branch-aware comparative drill-downs.',
        },
      ],
    });
  }

  @Get('modeling-preview')
  getModelingPreview() {
    return this.analyticsSemanticModelService.previewReadiness({
      capabilitiesExpected: 4,
      factCoveragePct: 79,
      dimensionCoveragePct: 76,
      cubeReadinessPct: 72,
      capabilities: [
        {
          key: 'FACT_TABLE',
          label: 'Fact Table',
          readinessPct: 81,
          semanticReady: true,
          routeCount: 2,
          primaryUseCase:
            'Define measurable business events with clear grain for booking, sales, inventory, and finance analytics.',
          nextFocus:
            'Broaden conformed measures across warehouse, procurement, and manufacturing events.',
        },
        {
          key: 'DIMENSION',
          label: 'Dimension',
          readinessPct: 76,
          semanticReady: true,
          routeCount: 2,
          primaryUseCase:
            'Publish reusable descriptive attributes for customer, supplier, time, warehouse, and organization slicing.',
          nextFocus: 'Strengthen slowly changing dimension strategy and conformance across marts.',
        },
        {
          key: 'OLAP',
          label: 'OLAP',
          readinessPct: 71,
          semanticReady: true,
          routeCount: 2,
          primaryUseCase:
            'Support multidimensional analysis, slice-and-dice queries, and aggregate drill paths.',
          nextFocus:
            'Improve aggregation policy and time hierarchy consistency before wider BI usage.',
        },
        {
          key: 'CUBE',
          label: 'Cube',
          readinessPct: 73,
          semanticReady: true,
          routeCount: 2,
          primaryUseCase:
            'Package reusable governed cubes for executive, finance, sales, and operational questions.',
          nextFocus: 'Add more business-ready cube templates and metric contract reviews.',
        },
      ],
    });
  }

  @Get('realtime-preview')
  getRealtimePreview() {
    return this.analyticsRealtimeService.previewReadiness({
      capabilitiesExpected: 1,
      streamCoveragePct: 68,
      freshnessSlaPct: 72,
      alertCoveragePct: 64,
      capabilities: [
        {
          key: 'REALTIME_ANALYTICS',
          label: 'Realtime Analytics',
          readinessPct: 71,
          streamReady: true,
          routeCount: 3,
          primaryUseCase:
            'Surface low-latency flow pressure, backlog spikes, and exception signals for faster response.',
          nextFocus:
            'Expand event freshness guarantees and alert routing before promoting wider realtime BI use.',
        },
      ],
    });
  }
}
