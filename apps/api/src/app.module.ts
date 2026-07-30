import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';

import { HealthModule } from './modules/health/health.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { validateEnvironment } from './config/env.validation';
import { RedisModule } from './modules/redis/redis.module';
import { MailModule } from './modules/mail/mail.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { MembershipsModule } from './modules/memberships/memberships.module';
import { RolesModule } from './modules/roles/roles.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { SettingsModule } from './modules/settings/settings.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PortalDashboardModule } from './modules/portal-dashboard/portal-dashboard.module';
import { PortalBookingsModule } from './modules/portal-bookings/portal-bookings.module';
import { PortalOrdersModule } from './modules/portal-orders/portal-orders.module';
import { PortalInvoicesModule } from './modules/portal-invoices/portal-invoices.module';
import { PortalPaymentsModule } from './modules/portal-payments/portal-payments.module';
import { PortalProfileModule } from './modules/portal-profile/portal-profile.module';
import { PortalSupportModule } from './modules/portal-support/portal-support.module';
import { SupportTicketsModule } from './modules/support-tickets/support-tickets.module';
import { PortalNotificationsModule } from './modules/portal-notifications/portal-notifications.module';
import { PortalTrackingModule } from './modules/portal-tracking/portal-tracking.module';
import { PortalDownloadsModule } from './modules/portal-downloads/portal-downloads.module';
import { ChartOfAccountsModule } from './modules/chart-of-accounts/chart-of-accounts.module';
import { GeneralLedgerModule } from './modules/general-ledger/general-ledger.module';
import { JournalsModule } from './modules/journals/journals.module';
import { AccountingPostingsModule } from './modules/accounting-postings/accounting-postings.module';
import { AccountingVouchersModule } from './modules/accounting-vouchers/accounting-vouchers.module';
import { BankAccountsModule } from './modules/bank-accounts/bank-accounts.module';
import { CashAccountsModule } from './modules/cash-accounts/cash-accounts.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { FixedAssetsModule } from './modules/fixed-assets/fixed-assets.module';
import { DepreciationModule } from './modules/depreciation/depreciation.module';
import { CostCentersModule } from './modules/cost-centers/cost-centers.module';
import { FiscalYearsModule } from './modules/fiscal-years/fiscal-years.module';
import { CurrenciesModule } from './modules/currencies/currencies.module';
import { ExchangeRatesModule } from './modules/exchange-rates/exchange-rates.module';
import { FinancialStatementsModule } from './modules/financial-statements/financial-statements.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { LeaveRequestsModule } from './modules/leave-requests/leave-requests.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { RecruitmentModule } from './modules/recruitment/recruitment.module';
import { PerformanceModule } from './modules/performance/performance.module';
import { TrainingModule } from './modules/training/training.module';
import { KpisModule } from './modules/kpis/kpis.module';
import { OrganizationChartModule } from './modules/organization-chart/organization-chart.module';
import { BillOfMaterialsModule } from './modules/bill-of-materials/bill-of-materials.module';
import { ProductionModule } from './modules/production/production.module';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module';
import { RoutingModule } from './modules/routing/routing.module';
import { MachinesModule } from './modules/machines/machines.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { QualityControlModule } from './modules/quality-control/quality-control.module';
import { ScrapModule } from './modules/scrap/scrap.module';
import { ProductionPlanningModule } from './modules/production-planning/production-planning.module';
import { MrpModule } from './modules/mrp/mrp.module';
import { CapacityPlanningModule } from './modules/capacity-planning/capacity-planning.module';
import { ChatErpModule } from './modules/chat-erp/chat-erp.module';
import { AskInventoryModule } from './modules/ask-inventory/ask-inventory.module';
import { AskFinanceModule } from './modules/ask-finance/ask-finance.module';
import { AskCrmModule } from './modules/ask-crm/ask-crm.module';
import { NaturalLanguageSearchModule } from './modules/natural-language-search/natural-language-search.module';
import { AiReportsModule } from './modules/ai-reports/ai-reports.module';
import { AiForecastModule } from './modules/ai-forecast/ai-forecast.module';
import { AiDocumentOcrModule } from './modules/ai-document-ocr/ai-document-ocr.module';
import { AiDocumentReviewModule } from './modules/ai-document-review/ai-document-review.module';
import { AiVisionModule } from './modules/ai-vision/ai-vision.module';
import { AiVoiceModule } from './modules/ai-voice/ai-voice.module';
import { AiMeetingModule } from './modules/ai-meeting/ai-meeting.module';
import { AiCopilotModule } from './modules/ai-copilot/ai-copilot.module';
import { AiRecommendationsModule } from './modules/ai-recommendations/ai-recommendations.module';
import { AiProcurementModule } from './modules/ai-procurement/ai-procurement.module';
import { AiSalesModule } from './modules/ai-sales/ai-sales.module';
import { AiAccountingModule } from './modules/ai-accounting/ai-accounting.module';
import { AiHrModule } from './modules/ai-hr/ai-hr.module';
import { AiManufacturingModule } from './modules/ai-manufacturing/ai-manufacturing.module';
import { AiAnalyticsModule } from './modules/ai-analytics/ai-analytics.module';
import { AiWorkspaceModule } from './modules/ai-workspace/ai-workspace.module';
import { AnalyticsWorkspaceModule } from './modules/analytics-workspace/analytics-workspace.module';
import { BiBuilderModule } from './modules/bi-builder/bi-builder.module';
import { DashboardBuilderModule } from './modules/dashboard-builder/dashboard-builder.module';
import { DocumentsWorkspaceModule } from './modules/documents-workspace/documents-workspace.module';
import { ApprovalFlowsModule } from './modules/approval-flows/approval-flows.module';
import { AutomationRulesModule } from './modules/automation-rules/automation-rules.module';
import { RuleEngineModule } from './modules/rule-engine/rule-engine.module';
import { WorkflowBuilderModule } from './modules/workflow-builder/workflow-builder.module';
import { AutomationTriggersModule } from './modules/automation-triggers/automation-triggers.module';
import { AutomationConditionsModule } from './modules/automation-conditions/automation-conditions.module';
import { AutomationActionsModule } from './modules/automation-actions/automation-actions.module';
import { AutomationRemindersModule } from './modules/automation-reminders/automation-reminders.module';
import { AutomationWebhooksModule } from './modules/automation-webhooks/automation-webhooks.module';
import { EmailAutomationModule } from './modules/email-automation/email-automation.module';
import { WhatsappAutomationModule } from './modules/whatsapp-automation/whatsapp-automation.module';
import { SlackAutomationModule } from './modules/slack-automation/slack-automation.module';
import { DiscordAutomationModule } from './modules/discord-automation/discord-automation.module';
import { CronJobsModule } from './modules/cron-jobs/cron-jobs.module';
import { ExecutiveDashboardModule } from './modules/executive-dashboard/executive-dashboard.module';
import { CeoDashboardModule } from './modules/ceo-dashboard/ceo-dashboard.module';
import { FinanceDashboardModule } from './modules/finance-dashboard/finance-dashboard.module';
import { InventoryDashboardModule } from './modules/inventory-dashboard/inventory-dashboard.module';
import { WarehouseDashboardModule } from './modules/warehouse-dashboard/warehouse-dashboard.module';
import { HrDashboardModule } from './modules/hr-dashboard/hr-dashboard.module';
import { ManufacturingDashboardModule } from './modules/manufacturing-dashboard/manufacturing-dashboard.module';
import { MobileWorkspaceModule } from './modules/mobile-workspace/mobile-workspace.module';
import { IntegrationsWorkspaceModule } from './modules/integrations-workspace/integrations-workspace.module';
import { PlatformWorkspaceModule } from './modules/platform-workspace/platform-workspace.module';
import { FormBuilderModule } from './modules/form-builder/form-builder.module';
import { LowCodeBuilderModule } from './modules/low-code-builder/low-code-builder.module';
import { GlobalEnterpriseModule } from './modules/global-enterprise/global-enterprise.module';
import { PluginMarketplaceModule } from './modules/plugin-marketplace/plugin-marketplace.module';
import { PublicApiModule } from './modules/public-api/public-api.module';
import { EnterpriseCloudModule } from './modules/enterprise-cloud/enterprise-cloud.module';
import { DevopsPlatformModule } from './modules/devops-platform/devops-platform.module';
import { EnterpriseSecurityModule } from './modules/enterprise-security/enterprise-security.module';
import { NovaOsModule } from './modules/nova-os/nova-os.module';
import { CustomersModule } from './modules/customers/customers.module';
import { CustomerGroupsModule } from './modules/customer-groups/customer-groups.module';
import { LocationsModule } from './modules/locations/locations.module';
import { ServicesModule } from './modules/services/services.module';
import { ServiceCategoriesModule } from './modules/service-categories/service-categories.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { ResourceGroupsModule } from './modules/resource-groups/resource-groups.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { BookingItemsModule } from './modules/booking-items/booking-items.module';
import { BookingGuestsModule } from './modules/booking-guests/booking-guests.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CheckInsModule } from './modules/check-ins/check-ins.module';
import { BookingNotificationsModule } from './modules/booking-notifications/booking-notifications.module';
import { BookingAnalyticsModule } from './modules/booking-analytics/booking-analytics.module';
import { ProductCategoriesModule } from './modules/product-categories/product-categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { UnitsOfMeasureModule } from './modules/units-of-measure/units-of-measure.module';
import { ProductsModule } from './modules/products/products.module';
import { ProductAttributesModule } from './modules/product-attributes/product-attributes.module';
import { ProductVariantsModule } from './modules/product-variants/product-variants.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';
import { WarehouseZonesModule } from './modules/warehouse-zones/warehouse-zones.module';
import { StorageLocationsModule } from './modules/storage-locations/storage-locations.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { InventoryReservationsModule } from './modules/inventory-reservations/inventory-reservations.module';
import { InventoryOpeningBalancesModule } from './modules/inventory-opening-balances/inventory-opening-balances.module';
import { InventoryAlertsModule } from './modules/inventory-alerts/inventory-alerts.module';
import { InventoryMovementsModule } from './modules/inventory-movements/inventory-movements.module';
import { GoodsReceiptsModule } from './modules/goods-receipts/goods-receipts.module';
import { GoodsIssuesModule } from './modules/goods-issues/goods-issues.module';
import { StockTransfersModule } from './modules/stock-transfers/stock-transfers.module';
import { StockAdjustmentsModule } from './modules/stock-adjustments/stock-adjustments.module';
import { InventoryStatusTransfersModule } from './modules/inventory-status-transfers/inventory-status-transfers.module';
import { InventoryAllocationsModule } from './modules/inventory-allocations/inventory-allocations.module';
import { PutawayModule } from './modules/putaway/putaway.module';
import { PickingModule } from './modules/picking/picking.module';
import { PackingModule } from './modules/packing/packing.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { WarehouseTasksModule } from './modules/warehouse-tasks/warehouse-tasks.module';
import { StockCountModule } from './modules/stock-count/stock-count.module';
import { InventoryMovementAnalyticsModule } from './modules/inventory-movement-analytics/inventory-movement-analytics.module';
import { InventoryMovementReportsModule } from './modules/inventory-movement-reports/inventory-movement-reports.module';
import { WarehouseScanningModule } from './modules/warehouse-scanning/warehouse-scanning.module';
import { PurchaseRequestsModule } from './modules/purchase-requests/purchase-requests.module';
import { RequestForQuotationsModule } from './modules/request-for-quotations/request-for-quotations.module';
import { SupplierQuotationsModule } from './modules/supplier-quotations/supplier-quotations.module';
import { VendorComparisonsModule } from './modules/vendor-comparisons/vendor-comparisons.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { PurchaseAgreementsModule } from './modules/purchase-agreements/purchase-agreements.module';
import { PurchaseApprovalsModule } from './modules/purchase-approvals/purchase-approvals.module';
import { PurchaseReceiptsModule } from './modules/purchase-receipts/purchase-receipts.module';
import { PurchaseInvoicePreparationModule } from './modules/purchase-invoice-preparation/purchase-invoice-preparation.module';
import { VendorPerformanceModule } from './modules/vendor-performance/vendor-performance.module';
import { PurchaseAnalyticsModule } from './modules/purchase-analytics/purchase-analytics.module';
import { LeadsModule } from './modules/leads/leads.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { DealsModule } from './modules/deals/deals.module';
import { SalesActivitiesModule } from './modules/sales-activities/sales-activities.module';
import { SalesCommunicationsModule } from './modules/sales-communications/sales-communications.module';
import { SalesQuotationsModule } from './modules/sales-quotations/sales-quotations.module';
import { SalesFunnelModule } from './modules/sales-funnel/sales-funnel.module';
import { SalesPipelineModule } from './modules/sales-pipeline/sales-pipeline.module';
import { CustomerTimelineModule } from './modules/customer-timeline/customer-timeline.module';
import { SalesExecutionModule } from './modules/sales-execution/sales-execution.module';
import { SalesDashboardModule } from './modules/sales-dashboard/sales-dashboard.module';
import { SalesOrdersModule } from './modules/sales-orders/sales-orders.module';
import { SalesInvoicesModule } from './modules/sales-invoices/sales-invoices.module';
import { DeliveryOrdersModule } from './modules/delivery-orders/delivery-orders.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { SalesReturnsModule } from './modules/sales-returns/sales-returns.module';
import { CreditNotesModule } from './modules/credit-notes/credit-notes.module';
import { DiscountEngineModule } from './modules/discount-engine/discount-engine.module';
import { TaxEngineModule } from './modules/tax-engine/tax-engine.module';
import { PriceListsModule } from './modules/price-lists/price-lists.module';
import { CustomerCreditModule } from './modules/customer-credit/customer-credit.module';
import { InstallmentsModule } from './modules/installments/installments.module';
import { SalesAnalyticsModule } from './modules/sales-analytics/sales-analytics.module';
import { ReportBuilderModule } from './modules/report-builder/report-builder.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        redact: [
          'req.headers.authorization',
          'req.headers.cookie',
          'res.headers["set-cookie"]',
          'req.body.password',
          'req.body.token',
        ],
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined
            : {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                },
              },
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.RATE_LIMIT_TTL ?? 60) * 1000,
        limit: Number(process.env.RATE_LIMIT_MAX ?? 20),
      },
    ]),
    CommonModule,
    DatabaseModule,
    RedisModule,
    MailModule,
    HealthModule,
    PermissionsModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    OrganizationsModule,
    WorkspacesModule,
    MembershipsModule,
    RolesModule,
    InvitationsModule,
    AuditLogsModule,
    SettingsModule,
    NotificationsModule,
    PortalDashboardModule,
    PortalBookingsModule,
    PortalOrdersModule,
    PortalInvoicesModule,
    PortalPaymentsModule,
    PortalProfileModule,
    PortalSupportModule,
    SupportTicketsModule,
    PortalNotificationsModule,
    PortalTrackingModule,
    PortalDownloadsModule,
    ChartOfAccountsModule,
    GeneralLedgerModule,
    JournalsModule,
    AccountingPostingsModule,
    AccountingVouchersModule,
    BankAccountsModule,
    CashAccountsModule,
    BudgetsModule,
    FixedAssetsModule,
    DepreciationModule,
    CostCentersModule,
    FiscalYearsModule,
    CurrenciesModule,
    ExchangeRatesModule,
    FinancialStatementsModule,
    EmployeesModule,
    DepartmentsModule,
    AttendanceModule,
    LeaveRequestsModule,
    PayrollModule,
    ShiftsModule,
    RecruitmentModule,
    PerformanceModule,
    TrainingModule,
    KpisModule,
    OrganizationChartModule,
    BillOfMaterialsModule,
    ProductionModule,
    WorkOrdersModule,
    RoutingModule,
    MachinesModule,
    MaintenanceModule,
    QualityControlModule,
    ScrapModule,
    ProductionPlanningModule,
    MrpModule,
    CapacityPlanningModule,
    ChatErpModule,
    AskInventoryModule,
    AskFinanceModule,
    AskCrmModule,
    NaturalLanguageSearchModule,
    AiReportsModule,
    AiForecastModule,
    AiDocumentOcrModule,
    AiDocumentReviewModule,
    AiVisionModule,
    AiVoiceModule,
    AiMeetingModule,
    AiCopilotModule,
    AiRecommendationsModule,
    AiProcurementModule,
    AiSalesModule,
    AiAccountingModule,
    AiHrModule,
    AiManufacturingModule,
    AiAnalyticsModule,
    AiWorkspaceModule,
    AnalyticsWorkspaceModule,
    BiBuilderModule,
    DashboardBuilderModule,
    DocumentsWorkspaceModule,
    ApprovalFlowsModule,
    AutomationRulesModule,
    RuleEngineModule,
    WorkflowBuilderModule,
    AutomationTriggersModule,
    AutomationConditionsModule,
    AutomationActionsModule,
    AutomationRemindersModule,
    AutomationWebhooksModule,
    EmailAutomationModule,
    WhatsappAutomationModule,
    SlackAutomationModule,
    DiscordAutomationModule,
    CronJobsModule,
    ExecutiveDashboardModule,
    CeoDashboardModule,
    FinanceDashboardModule,
    InventoryDashboardModule,
    WarehouseDashboardModule,
    HrDashboardModule,
    ManufacturingDashboardModule,
    MobileWorkspaceModule,
    IntegrationsWorkspaceModule,
    PlatformWorkspaceModule,
    FormBuilderModule,
    LowCodeBuilderModule,
    GlobalEnterpriseModule,
    PluginMarketplaceModule,
    PublicApiModule,
    EnterpriseCloudModule,
    DevopsPlatformModule,
    EnterpriseSecurityModule,
    NovaOsModule,
    CustomersModule,
    CustomerGroupsModule,
    LocationsModule,
    ServicesModule,
    ServiceCategoriesModule,
    ResourcesModule,
    ResourceGroupsModule,
    AvailabilityModule,
    SchedulesModule,
    BookingsModule,
    BookingItemsModule,
    BookingGuestsModule,
    PricingModule,
    PromotionsModule,
    InvoicesModule,
    PaymentsModule,
    CheckInsModule,
    BookingNotificationsModule,
    BookingAnalyticsModule,
    ProductCategoriesModule,
    BrandsModule,
    UnitsOfMeasureModule,
    ProductsModule,
    ProductAttributesModule,
    ProductVariantsModule,
    SuppliersModule,
    WarehousesModule,
    WarehouseZonesModule,
    StorageLocationsModule,
    InventoryModule,
    InventoryReservationsModule,
    InventoryOpeningBalancesModule,
    InventoryAlertsModule,
    InventoryMovementsModule,
    GoodsReceiptsModule,
    GoodsIssuesModule,
    StockTransfersModule,
    StockAdjustmentsModule,
    InventoryStatusTransfersModule,
    InventoryAllocationsModule,
    PutawayModule,
    PickingModule,
    PackingModule,
    DispatchModule,
    WarehouseTasksModule,
    StockCountModule,
    InventoryMovementAnalyticsModule,
    InventoryMovementReportsModule,
    WarehouseScanningModule,
    PurchaseRequestsModule,
    RequestForQuotationsModule,
    SupplierQuotationsModule,
    VendorComparisonsModule,
    PurchaseOrdersModule,
    PurchaseAgreementsModule,
    PurchaseApprovalsModule,
    PurchaseReceiptsModule,
    PurchaseInvoicePreparationModule,
    VendorPerformanceModule,
    PurchaseAnalyticsModule,
    LeadsModule,
    OpportunitiesModule,
    DealsModule,
    SalesActivitiesModule,
    SalesCommunicationsModule,
    SalesQuotationsModule,
    SalesFunnelModule,
    SalesPipelineModule,
    CustomerTimelineModule,
    SalesExecutionModule,
    SalesDashboardModule,
    SalesOrdersModule,
    SalesInvoicesModule,
    DeliveryOrdersModule,
    ShipmentsModule,
    SalesReturnsModule,
    CreditNotesModule,
    DiscountEngineModule,
    TaxEngineModule,
    PriceListsModule,
    CustomerCreditModule,
    InstallmentsModule,
    SalesAnalyticsModule,
    ReportBuilderModule,
  ],
})
export class AppModule {}
