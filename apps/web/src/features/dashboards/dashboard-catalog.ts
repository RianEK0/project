export type DashboardSlug =
  | 'executive'
  | 'ceo'
  | 'finance'
  | 'inventory'
  | 'warehouse'
  | 'sales'
  | 'crm'
  | 'hr'
  | 'manufacturing';

export type DashboardCatalogItem = {
  slug: DashboardSlug;
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
};

export const dashboardCatalog: DashboardCatalogItem[] = [
  {
    slug: 'executive',
    href: '/app/dashboards/executive',
    label: 'Executive Dashboard',
    badge: 'Enterprise',
    eyebrow: 'Executive',
    title: 'Track cross-domain health in one leadership cockpit',
    description:
      'Executive dashboard merangkum growth, runway, fulfillment, inventory exposure, workforce, dan capacity signal untuk operasional bulanan.',
    highlights: [
      'Growth and cash balance',
      'Fulfillment and inventory pressure',
      'People and capacity readiness',
      'Cross-domain attention routing',
    ],
    relatedLinks: [
      { href: '/app/dashboards/ceo', label: 'CEO dashboard' },
      { href: '/app/dashboards/finance', label: 'Finance dashboard' },
      { href: '/app/dashboards/manufacturing', label: 'Manufacturing dashboard' },
    ],
    eyebrowClassName: 'text-indigo-700 dark:text-indigo-300',
    hoverClassName: 'hover:border-indigo-300',
    actionClassName: 'text-indigo-700 dark:text-indigo-300',
  },
  {
    slug: 'ceo',
    href: '/app/dashboards/ceo',
    label: 'CEO Dashboard',
    badge: 'Board Brief',
    eyebrow: 'CEO',
    title: 'Convert signals into a concise quarterly leadership briefing',
    description:
      'CEO dashboard memfokuskan board narrative pada revenue run-rate, liquidity, strategic initiative delivery, dan escalation pressure.',
    highlights: [
      'Quarterly action bias',
      'Board briefing summary',
      'Pipeline and liquidity watch',
      'Escalation clearance focus',
    ],
    relatedLinks: [
      { href: '/app/dashboards/executive', label: 'Executive dashboard' },
      { href: '/app/dashboards/sales', label: 'Sales dashboard' },
      { href: '/app/dashboards/finance', label: 'Finance dashboard' },
    ],
    eyebrowClassName: 'text-slate-700 dark:text-slate-300',
    hoverClassName: 'hover:border-slate-400',
    actionClassName: 'text-slate-700 dark:text-slate-300',
  },
  {
    slug: 'finance',
    href: '/app/dashboards/finance',
    label: 'Finance Dashboard',
    badge: 'Liquidity',
    eyebrow: 'Finance',
    title: 'Watch runway, liquidity, receivables, and budget discipline',
    description:
      'Finance dashboard menyiapkan scorecard ringkas untuk treasury resilience, receivable pressure, dan closing discipline.',
    highlights: [
      'Cash runway visibility',
      'Current ratio and liquidity signal',
      'Receivables pressure',
      'Budget variance watch',
    ],
    relatedLinks: [
      { href: '/app/finance/cash-flow', label: 'Cash flow' },
      { href: '/app/finance/budgets', label: 'Budgets' },
      { href: '/app/finance/balance-sheet', label: 'Balance sheet' },
    ],
    eyebrowClassName: 'text-amber-700 dark:text-amber-300',
    hoverClassName: 'hover:border-amber-300',
    actionClassName: 'text-amber-700 dark:text-amber-300',
  },
  {
    slug: 'inventory',
    href: '/app/dashboards/inventory',
    label: 'Inventory Dashboard',
    badge: 'Stock Health',
    eyebrow: 'Inventory',
    title: 'Surface blocked, aging, and replenishment risk before it compounds',
    description:
      'Inventory dashboard membaca nilai stok, aging exposure, stock accuracy, dan reorder pressure untuk menjaga working capital tetap sehat.',
    highlights: [
      'Blocked stock percentage',
      'Aging stock percentage',
      'Stock accuracy watch',
      'Reorder alert pressure',
    ],
    relatedLinks: [
      { href: '/app/inventory', label: 'Inventory workspace' },
      { href: '/app/warehouse-operations/stock-counts', label: 'Stock counts' },
      { href: '/app/procurement/analytics', label: 'Procurement analytics' },
    ],
    eyebrowClassName: 'text-emerald-700 dark:text-emerald-300',
    hoverClassName: 'hover:border-emerald-300',
    actionClassName: 'text-emerald-700 dark:text-emerald-300',
  },
  {
    slug: 'warehouse',
    href: '/app/dashboards/warehouse',
    label: 'Warehouse Dashboard',
    badge: 'Control Tower',
    eyebrow: 'Warehouse',
    title: 'Keep warehouse flow visible across tasks, receiving, and dispatch',
    description:
      'Warehouse dashboard memfokuskan control tower pada open tasks, overdue pressure, receipt backlog, dispatch readiness, dan picking accuracy.',
    highlights: [
      'Task overdue rate',
      'Flow pressure indicator',
      'Dispatch readiness',
      'Picking accuracy visibility',
    ],
    relatedLinks: [
      { href: '/app/warehouse-operations/dashboard', label: 'Warehouse operations hub' },
      { href: '/app/warehouse-operations/tasks', label: 'Warehouse tasks' },
      { href: '/app/warehouse-operations/dispatch', label: 'Dispatch' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
  },
  {
    slug: 'sales',
    href: '/app/dashboards/sales',
    label: 'Sales Dashboard',
    badge: 'Order-to-Cash',
    eyebrow: 'Sales',
    title: 'Read order-to-cash performance with live conversion and collection signals',
    description:
      'Sales dashboard memakai analytics order, invoicing, return, dan collection supaya tim komersial dan operasi bisa membaca momentum fulfillment.',
    highlights: [
      'Fill and invoice rate',
      'Return and collection signal',
      'Open order value',
      'Overdue receivable watch',
    ],
    relatedLinks: [
      { href: '/app/sales/dashboard', label: 'Sales workspace dashboard' },
      { href: '/app/sales/analytics', label: 'Sales analytics' },
      { href: '/app/sales/orders', label: 'Sales orders' },
    ],
    eyebrowClassName: 'text-fuchsia-700 dark:text-fuchsia-300',
    hoverClassName: 'hover:border-fuchsia-300',
    actionClassName: 'text-fuchsia-700 dark:text-fuchsia-300',
  },
  {
    slug: 'crm',
    href: '/app/dashboards/crm',
    label: 'CRM Dashboard',
    badge: 'Commercial',
    eyebrow: 'CRM',
    title: 'Watch lead, opportunity, quotation, and weighted pipeline momentum',
    description:
      'CRM dashboard memusatkan perhatian pada lead inflow, active opportunity mix, quotation load, dan weighted pipeline starter.',
    highlights: [
      'Lead creation visibility',
      'Opportunity coverage',
      'Quotation watchlist',
      'Weighted pipeline focus',
    ],
    relatedLinks: [
      { href: '/app/crm/dashboard', label: 'CRM workspace dashboard' },
      { href: '/app/crm/funnel', label: 'Sales funnel' },
      { href: '/app/crm/pipeline', label: 'Pipeline' },
    ],
    eyebrowClassName: 'text-cyan-700 dark:text-cyan-300',
    hoverClassName: 'hover:border-cyan-300',
    actionClassName: 'text-cyan-700 dark:text-cyan-300',
  },
  {
    slug: 'hr',
    href: '/app/dashboards/hr',
    label: 'HR Dashboard',
    badge: 'People Ops',
    eyebrow: 'HR',
    title: 'Track attendance, recruitment load, review backlog, and learning progress',
    description:
      'HR dashboard menyorot attendance stability, recruiting load, overdue review, dan training completion sebagai sinyal people operations.',
    highlights: [
      'Attendance stability',
      'Recruiting load percentage',
      'Review backlog',
      'Training completion watch',
    ],
    relatedLinks: [
      { href: '/app/hr/attendance', label: 'Attendance' },
      { href: '/app/hr/recruitment', label: 'Recruitment' },
      { href: '/app/hr/performance', label: 'Performance' },
    ],
    eyebrowClassName: 'text-rose-700 dark:text-rose-300',
    hoverClassName: 'hover:border-rose-300',
    actionClassName: 'text-rose-700 dark:text-rose-300',
  },
  {
    slug: 'manufacturing',
    href: '/app/dashboards/manufacturing',
    label: 'Manufacturing Dashboard',
    badge: 'Throughput',
    eyebrow: 'Manufacturing',
    title: 'Keep weekly throughput visible across load, yield, and shortages',
    description:
      'Manufacturing dashboard mengikat capacity utilization, first-pass yield, shortage orders, dan gap hours dalam satu lane mingguan.',
    highlights: [
      'Weekly utilization',
      'First-pass yield watch',
      'Shortage order exposure',
      'Throughput gap hours',
    ],
    relatedLinks: [
      { href: '/app/manufacturing/capacity-planning', label: 'Capacity planning' },
      { href: '/app/manufacturing/quality-control', label: 'Quality control' },
      { href: '/app/manufacturing/mrp', label: 'MRP' },
    ],
    eyebrowClassName: 'text-orange-700 dark:text-orange-300',
    hoverClassName: 'hover:border-orange-300',
    actionClassName: 'text-orange-700 dark:text-orange-300',
  },
];

export function getDashboardCatalogItem(dashboardSlug: string): DashboardCatalogItem | undefined {
  return dashboardCatalog.find((item) => item.slug === dashboardSlug);
}
