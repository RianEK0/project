import type { AnalyticsWorkspaceArea, AnalyticsWorkspaceCapabilityKey } from '@nova/shared-types';

export type AnalyticsCapabilitySlug =
  | 'inventory'
  | 'sales'
  | 'purchase'
  | 'accounting'
  | 'hr'
  | 'manufacturing'
  | 'booking'
  | 'crm'
  | 'customer'
  | 'supplier'
  | 'warehouse'
  | 'fact-table'
  | 'dimension'
  | 'olap'
  | 'cube'
  | 'realtime-analytics';

export type AnalyticsCapabilityItem = {
  slug: AnalyticsCapabilitySlug;
  key: AnalyticsWorkspaceCapabilityKey;
  area: AnalyticsWorkspaceArea;
  href: string;
  label: string;
  badge: string;
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  relatedLinks: Array<{
    href: string;
    label: string;
  }>;
  eyebrowClassName: string;
  hoverClassName: string;
  actionClassName: string;
  apiPreview: 'operations' | 'entity' | 'modeling' | 'realtime';
};

export type AnalyticsAreaCard = {
  id: string;
  label: string;
  badge: string;
  summary: string;
  className: string;
};

export const analyticsAreaCards: AnalyticsAreaCard[] = [
  {
    id: 'domain-operations',
    label: 'Domain Operations',
    badge: '8 lanes',
    summary:
      'Inventory, sales, purchase, accounting, HR, manufacturing, booking, dan CRM analytics digabungkan sebagai BI lane lintas proses.',
    className: 'border-sky-200/80 bg-sky-50/70 dark:border-sky-900/60 dark:bg-sky-950/20',
  },
  {
    id: 'entity-intelligence',
    label: 'Entity Intelligence',
    badge: '3 lanes',
    summary:
      'Customer, supplier, dan warehouse analytics membentuk 360 view untuk master-data decision support.',
    className:
      'border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/20',
  },
  {
    id: 'semantic-model',
    label: 'Semantic Model',
    badge: '4 lanes',
    summary:
      'Fact table, dimension, OLAP, dan cube menjadi lane pemodelan BI yang governed dan reusable.',
    className: 'border-amber-200/80 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20',
  },
  {
    id: 'realtime',
    label: 'Realtime',
    badge: '1 lane',
    summary:
      'Realtime analytics memfokuskan freshness, stream coverage, dan alert-driven BI untuk operasi cepat.',
    className: 'border-rose-200/80 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/20',
  },
];

export const analyticsCapabilityCatalog: AnalyticsCapabilityItem[] = [
  {
    slug: 'inventory',
    key: 'INVENTORY_ANALYTICS',
    area: 'DOMAIN_OPERATIONS',
    href: '/app/analytics/inventory',
    label: 'Inventory',
    badge: 'Domain Operations',
    eyebrow: 'Inventory Analytics',
    title:
      'Read stock health, replenishment pressure, and working-capital exposure through one BI lane',
    description:
      'Inventory analytics lane memfokuskan aging, accuracy, replenishment, dan stock exposure agar planner dan operator punya satu pandangan BI yang lebih rapi.',
    highlights: [
      'Stock health and aging visibility',
      'Replenishment pressure signals',
      'Cross-warehouse exposure review',
      'Working-capital aware inventory decisions',
    ],
    relatedLinks: [
      { href: '/app/inventory', label: 'Inventory workspace' },
      { href: '/app/dashboards/inventory', label: 'Inventory dashboard' },
      { href: '/app/warehouse-operations/stock-counts', label: 'Stock counts' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
    apiPreview: 'operations',
  },
  {
    slug: 'sales',
    key: 'SALES_ANALYTICS',
    area: 'DOMAIN_OPERATIONS',
    href: '/app/analytics/sales',
    label: 'Sales',
    badge: 'Domain Operations',
    eyebrow: 'Sales Analytics',
    title: 'Follow order-to-cash momentum from demand through invoicing and collection',
    description:
      'Sales analytics lane menyatukan order, fulfillment, invoice, return, dan collection signal supaya tim komersial membaca momentum bisnis dengan cepat.',
    highlights: [
      'Order-to-cash performance',
      'Fulfillment and invoice movement',
      'Return and collection visibility',
      'Commercial KPI drill paths',
    ],
    relatedLinks: [
      { href: '/app/sales/analytics', label: 'Sales analytics' },
      { href: '/app/dashboards/sales', label: 'Sales dashboard' },
      { href: '/app/sales/orders', label: 'Sales orders' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
    apiPreview: 'operations',
  },
  {
    slug: 'purchase',
    key: 'PURCHASE_ANALYTICS',
    area: 'DOMAIN_OPERATIONS',
    href: '/app/analytics/purchase',
    label: 'Purchase',
    badge: 'Domain Operations',
    eyebrow: 'Purchase Analytics',
    title: 'Measure sourcing flow, vendor responsiveness, and PO progression in one place',
    description:
      'Purchase analytics lane membantu procurement melihat request funnel, RFQ flow, PO movement, dan invoice-prep signal secara lebih menyeluruh.',
    highlights: [
      'Request-to-order funnel',
      'Vendor responsiveness signals',
      'PO and invoice-prep visibility',
      'Sourcing KPI review',
    ],
    relatedLinks: [
      { href: '/app/procurement/analytics', label: 'Procurement analytics' },
      { href: '/app/procurement/requests', label: 'Purchase requests' },
      { href: '/app/procurement/orders', label: 'Purchase orders' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
    apiPreview: 'operations',
  },
  {
    slug: 'accounting',
    key: 'ACCOUNTING_ANALYTICS',
    area: 'DOMAIN_OPERATIONS',
    href: '/app/analytics/accounting',
    label: 'Accounting',
    badge: 'Domain Operations',
    eyebrow: 'Accounting Analytics',
    title: 'Make close discipline, journal movement, and finance signal shifts easier to review',
    description:
      'Accounting analytics lane memusatkan posting, journal, statement, dan variance signal agar finance review tidak terpecah di banyak halaman.',
    highlights: [
      'Close and posting visibility',
      'Journal and variance narratives',
      'Statement-linked KPI review',
      'Finance-ready drill-down support',
    ],
    relatedLinks: [
      { href: '/app/finance/general-ledger', label: 'General ledger' },
      { href: '/app/finance/financial-statements', label: 'Financial statements' },
      { href: '/app/dashboards/finance', label: 'Finance dashboard' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
    apiPreview: 'operations',
  },
  {
    slug: 'hr',
    key: 'HR_ANALYTICS',
    area: 'DOMAIN_OPERATIONS',
    href: '/app/analytics/hr',
    label: 'HR',
    badge: 'Domain Operations',
    eyebrow: 'HR Analytics',
    title: 'Track workforce health through attendance, recruitment, review, and training metrics',
    description:
      'HR analytics lane menyatukan people ops signal agar attendance, hiring load, review backlog, dan training completion lebih mudah ditinjau.',
    highlights: [
      'Attendance and people-ops stability',
      'Recruitment and review load',
      'Training completion visibility',
      'Workforce planning starter',
    ],
    relatedLinks: [
      { href: '/app/hr/attendance', label: 'Attendance' },
      { href: '/app/hr/recruitment', label: 'Recruitment' },
      { href: '/app/dashboards/hr', label: 'HR dashboard' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
    apiPreview: 'operations',
  },
  {
    slug: 'manufacturing',
    key: 'MANUFACTURING_ANALYTICS',
    area: 'DOMAIN_OPERATIONS',
    href: '/app/analytics/manufacturing',
    label: 'Manufacturing',
    badge: 'Domain Operations',
    eyebrow: 'Manufacturing Analytics',
    title: 'Keep throughput, shortages, yield, and capacity shifts visible in one BI lane',
    description:
      'Manufacturing analytics lane membantu production lead membaca throughput, shortage, yield, dan capacity signal tanpa membuka banyak view.',
    highlights: [
      'Throughput and yield review',
      'Shortage and capacity visibility',
      'Production flow KPI lane',
      'Work-center signal comparison',
    ],
    relatedLinks: [
      { href: '/app/manufacturing/planning', label: 'Production planning' },
      { href: '/app/manufacturing/mrp', label: 'MRP' },
      { href: '/app/dashboards/manufacturing', label: 'Manufacturing dashboard' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
    apiPreview: 'operations',
  },
  {
    slug: 'booking',
    key: 'BOOKING_ANALYTICS',
    area: 'DOMAIN_OPERATIONS',
    href: '/app/analytics/booking',
    label: 'Booking',
    badge: 'Domain Operations',
    eyebrow: 'Booking Analytics',
    title: 'Translate booking demand, utilization, and payment completion into clear BI signals',
    description:
      'Booking analytics lane memberi pandangan lebih rapi atas demand, utilization, cancellation, dan payment completion pada foundation booking universal.',
    highlights: [
      'Demand and utilization review',
      'Cancellation and completion visibility',
      'Payment completion signals',
      'Channel and service slice starter',
    ],
    relatedLinks: [
      { href: '/app/bookings', label: 'Bookings' },
      { href: '/app/analytics', label: 'Analytics workspace' },
      { href: '/app/calendar', label: 'Calendar' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
    apiPreview: 'operations',
  },
  {
    slug: 'crm',
    key: 'CRM_ANALYTICS',
    area: 'DOMAIN_OPERATIONS',
    href: '/app/analytics/crm',
    label: 'CRM',
    badge: 'Domain Operations',
    eyebrow: 'CRM Analytics',
    title:
      'Read lead, opportunity, quotation, and weighted pipeline movement without losing context',
    description:
      'CRM analytics lane merangkum lead inflow, pipeline health, quotation pressure, dan conversion signal untuk commercial review.',
    highlights: [
      'Lead and opportunity momentum',
      'Weighted pipeline visibility',
      'Quotation pressure signal',
      'Commercial conversion drill-downs',
    ],
    relatedLinks: [
      { href: '/app/crm/dashboard', label: 'CRM dashboard' },
      { href: '/app/crm/pipeline', label: 'Pipeline' },
      { href: '/app/dashboards/crm', label: 'CRM dashboard workspace' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
    apiPreview: 'operations',
  },
  {
    slug: 'customer',
    key: 'CUSTOMER_ANALYTICS',
    area: 'ENTITY_INTELLIGENCE',
    href: '/app/analytics/customer',
    label: 'Customer',
    badge: 'Entity Intelligence',
    eyebrow: 'Customer Analytics',
    title: 'Build a 360 customer view from booking, sales, invoice, and support behavior',
    description:
      'Customer analytics lane membantu menyatukan hubungan customer dengan transaksi, payment, dan support menjadi satu sudut pandang BI.',
    highlights: [
      'Customer 360 signal view',
      'Revenue and service mix insight',
      'Payment and support context',
      'Cohort and health starter',
    ],
    relatedLinks: [
      { href: '/app/customers', label: 'Customers' },
      { href: '/portal/dashboard', label: 'Portal dashboard' },
      { href: '/app/crm/timeline', label: 'Customer timeline' },
    ],
    eyebrowClassName: 'text-emerald-700 dark:text-emerald-300',
    hoverClassName: 'hover:border-emerald-300',
    actionClassName: 'text-emerald-700 dark:text-emerald-300',
    apiPreview: 'entity',
  },
  {
    slug: 'supplier',
    key: 'SUPPLIER_ANALYTICS',
    area: 'ENTITY_INTELLIGENCE',
    href: '/app/analytics/supplier',
    label: 'Supplier',
    badge: 'Entity Intelligence',
    eyebrow: 'Supplier Analytics',
    title: 'Review supplier responsiveness, dependence, and sourcing exposure as one BI story',
    description:
      'Supplier analytics lane menghubungkan lead time, performance, dan purchasing exposure ke satu tampilan vendor intelligence.',
    highlights: [
      'Supplier responsiveness review',
      'Dependency and risk visibility',
      'Lead-time and performance context',
      'Sourcing network starter',
    ],
    relatedLinks: [
      { href: '/app/suppliers', label: 'Suppliers' },
      { href: '/app/procurement/vendors/performance', label: 'Vendor performance' },
      { href: '/app/procurement/vendors/lead-times', label: 'Vendor lead times' },
    ],
    eyebrowClassName: 'text-emerald-700 dark:text-emerald-300',
    hoverClassName: 'hover:border-emerald-300',
    actionClassName: 'text-emerald-700 dark:text-emerald-300',
    apiPreview: 'entity',
  },
  {
    slug: 'warehouse',
    key: 'WAREHOUSE_ANALYTICS',
    area: 'ENTITY_INTELLIGENCE',
    href: '/app/analytics/warehouse',
    label: 'Warehouse',
    badge: 'Entity Intelligence',
    eyebrow: 'Warehouse Analytics',
    title: 'Compare warehouse behavior across throughput, backlog, and stock-control patterns',
    description:
      'Warehouse analytics lane membuat perbandingan antar gudang lebih jelas untuk throughput, backlog, akurasi, dan execution flow.',
    highlights: [
      'Inter-warehouse comparisons',
      'Throughput and backlog visibility',
      'Stock-control and accuracy review',
      'Branch and entity benchmarking starter',
    ],
    relatedLinks: [
      { href: '/app/warehouses', label: 'Warehouses' },
      { href: '/app/warehouse-operations/reports', label: 'Warehouse reports' },
      { href: '/app/dashboards/warehouse', label: 'Warehouse dashboard' },
    ],
    eyebrowClassName: 'text-emerald-700 dark:text-emerald-300',
    hoverClassName: 'hover:border-emerald-300',
    actionClassName: 'text-emerald-700 dark:text-emerald-300',
    apiPreview: 'entity',
  },
  {
    slug: 'fact-table',
    key: 'FACT_TABLE',
    area: 'SEMANTIC_MODEL',
    href: '/app/analytics/fact-table',
    label: 'Fact Table',
    badge: 'Semantic Model',
    eyebrow: 'Fact Table',
    title: 'Anchor NovaERP BI on stable measurable events and clear analytic grain',
    description:
      'Fact table lane menjadi fondasi pengukuran untuk transaksi inti NovaERP agar BI tidak kehilangan grain dan lineage.',
    highlights: [
      'Stable measurable events',
      'Clear analytic grain',
      'Cross-domain measure reuse',
      'Lineage-aware modeling starter',
    ],
    relatedLinks: [
      { href: '/app/finance/financial-statements', label: 'Financial statements' },
      { href: '/app/warehouse-operations/reports', label: 'Warehouse reports' },
      { href: '/app/dashboards/executive', label: 'Executive dashboard' },
    ],
    eyebrowClassName: 'text-amber-700 dark:text-amber-300',
    hoverClassName: 'hover:border-amber-300',
    actionClassName: 'text-amber-700 dark:text-amber-300',
    apiPreview: 'modeling',
  },
  {
    slug: 'dimension',
    key: 'DIMENSION',
    area: 'SEMANTIC_MODEL',
    href: '/app/analytics/dimension',
    label: 'Dimension',
    badge: 'Semantic Model',
    eyebrow: 'Dimension',
    title: 'Model reusable descriptive context that keeps analytics slicing consistent',
    description:
      'Dimension lane memfokuskan atribut deskriptif seperti waktu, customer, supplier, warehouse, dan organisasi agar slicing BI lebih konsisten.',
    highlights: [
      'Reusable descriptive context',
      'Conformed slicing across marts',
      'Slowly changing dimension starter',
      'Master-data aware BI modeling',
    ],
    relatedLinks: [
      { href: '/app/customers', label: 'Customers' },
      { href: '/app/suppliers', label: 'Suppliers' },
      { href: '/app/platform/multi-company', label: 'Multi company' },
    ],
    eyebrowClassName: 'text-amber-700 dark:text-amber-300',
    hoverClassName: 'hover:border-amber-300',
    actionClassName: 'text-amber-700 dark:text-amber-300',
    apiPreview: 'modeling',
  },
  {
    slug: 'olap',
    key: 'OLAP',
    area: 'SEMANTIC_MODEL',
    href: '/app/analytics/olap',
    label: 'OLAP',
    badge: 'Semantic Model',
    eyebrow: 'OLAP',
    title:
      'Support multidimensional analysis without forcing users back into raw transactional views',
    description:
      'OLAP lane menyiapkan slice-and-dice, hierarchy, dan multidimensional review untuk pertanyaan bisnis lintas domain.',
    highlights: [
      'Multidimensional analysis',
      'Hierarchy and drill-path support',
      'Cross-domain aggregation layer',
      'Governed BI exploration starter',
    ],
    relatedLinks: [
      { href: '/app/dashboards', label: 'Dashboards' },
      { href: '/app/ai/analytics', label: 'AI analytics' },
      { href: '/app/analytics/fact-table', label: 'Fact table' },
    ],
    eyebrowClassName: 'text-amber-700 dark:text-amber-300',
    hoverClassName: 'hover:border-amber-300',
    actionClassName: 'text-amber-700 dark:text-amber-300',
    apiPreview: 'modeling',
  },
  {
    slug: 'cube',
    key: 'CUBE',
    area: 'SEMANTIC_MODEL',
    href: '/app/analytics/cube',
    label: 'Cube',
    badge: 'Semantic Model',
    eyebrow: 'Cube',
    title: 'Package common business questions into reusable governed cubes for faster BI delivery',
    description:
      'Cube lane membuat pertanyaan bisnis berulang lebih mudah dihidangkan melalui paket agregasi yang reusable dan tetap governed.',
    highlights: [
      'Reusable governed aggregates',
      'Faster business-question delivery',
      'Metric contract consistency',
      'Domain-ready cube starter',
    ],
    relatedLinks: [
      { href: '/app/dashboards/finance', label: 'Finance dashboard' },
      { href: '/app/dashboards/sales', label: 'Sales dashboard' },
      { href: '/app/analytics/olap', label: 'OLAP' },
    ],
    eyebrowClassName: 'text-amber-700 dark:text-amber-300',
    hoverClassName: 'hover:border-amber-300',
    actionClassName: 'text-amber-700 dark:text-amber-300',
    apiPreview: 'modeling',
  },
  {
    slug: 'realtime-analytics',
    key: 'REALTIME_ANALYTICS',
    area: 'REALTIME',
    href: '/app/analytics/realtime-analytics',
    label: 'Realtime Analytics',
    badge: 'Realtime',
    eyebrow: 'Realtime Analytics',
    title: 'Push low-latency signals closer to operators when waiting for batch BI is too slow',
    description:
      'Realtime analytics lane memusatkan freshness, stream coverage, dan alerting agar operasi yang sensitif waktu mendapat sinyal lebih cepat.',
    highlights: [
      'Low-latency KPI visibility',
      'Event freshness and alert routing',
      'Operational escalation support',
      'Streaming BI starter',
    ],
    relatedLinks: [
      { href: '/app/warehouse-operations/dashboard', label: 'Warehouse control tower' },
      { href: '/app/automation/webhooks', label: 'Automation webhooks' },
      { href: '/app/mobile/offline-sync', label: 'Offline sync' },
    ],
    eyebrowClassName: 'text-rose-700 dark:text-rose-300',
    hoverClassName: 'hover:border-rose-300',
    actionClassName: 'text-rose-700 dark:text-rose-300',
    apiPreview: 'realtime',
  },
];

export function getAnalyticsCapabilityItem(slug: string) {
  return analyticsCapabilityCatalog.find((capability) => capability.slug === slug);
}
