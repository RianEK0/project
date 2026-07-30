import Link from 'next/link';

import { StatusBadge, SurfaceCard } from '@nova/ui';

const operationCards = [
  {
    href: '/app/warehouse-operations/movements',
    label: 'Movement Engine',
    description:
      'Track the generic inventory movement backbone, approval flow, and append-only ledger behavior.',
    badge: 'Core Engine',
  },
  {
    href: '/app/warehouse-operations/receipts',
    label: 'Goods Receipt',
    description:
      'Capture inbound receiving, inspection, lot and serial intake, and receiving location control.',
    badge: 'Inbound',
  },
  {
    href: '/app/warehouse-operations/issues',
    label: 'Goods Issue',
    description:
      'Orchestrate allocation, picking, packing, and issue posting for outbound stock execution.',
    badge: 'Outbound',
  },
  {
    href: '/app/warehouse-operations/transfers',
    label: 'Transfers',
    description:
      'Support internal and inter-warehouse transfers with shipment, transit, receipt, and putaway stages.',
    badge: 'Cross-Warehouse',
  },
  {
    href: '/app/warehouse-operations/adjustments',
    label: 'Adjustments',
    description:
      'Handle controlled stock corrections, damage, expiration, and sensitive mutation approvals.',
    badge: 'Control',
  },
  {
    href: '/app/warehouse-operations/putaway',
    label: 'Putaway',
    description:
      'Turn receiving stock into storage-ready inventory with location suggestion and execution tracking.',
    badge: 'Task Flow',
  },
  {
    href: '/app/warehouse-operations/picking',
    label: 'Picking',
    description:
      'Create wave and task-level execution views for reservation fulfillment and dispatch preparation.',
    badge: 'Execution',
  },
  {
    href: '/app/warehouse-operations/packing',
    label: 'Packing',
    description:
      'Stage basic packing sessions, package counts, and pre-dispatch handling in one operational lane.',
    badge: 'Execution',
  },
  {
    href: '/app/warehouse-operations/tasks',
    label: 'Warehouse Tasks',
    description:
      'Coordinate workload, assignments, and team execution across receiving, picking, packing, and count.',
    badge: 'Workforce',
  },
  {
    href: '/app/warehouse-operations/stock-counts',
    label: 'Stock Count',
    description:
      'Protect freeze windows, count scope, variance review, and posting control for cycle or full counts.',
    badge: 'Accuracy',
  },
  {
    href: '/app/warehouse-operations/scan',
    label: 'Scanning',
    description:
      'Provide barcode-first scan workflows for product, lot, serial, location, and warehouse actions.',
    badge: 'Mobility',
  },
  {
    href: '/app/warehouse-operations/reports',
    label: 'Reports',
    description:
      'Expose the starter catalog for movement ledger, allocation, and warehouse productivity reporting.',
    badge: 'Analytics',
  },
] as const;

const inventoryLinks = [
  {
    href: '/app/inventory/allocations',
    label: 'Inventory Allocations',
  },
  {
    href: '/app/inventory/status-transfers',
    label: 'Inventory Status Transfers',
  },
] as const;

export function WarehouseOperationsHub() {
  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">
              Warehouse Operations
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Sprint 3B control tower for stock movement execution
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Schema Ready</StatusBadge>
            <StatusBadge tone="success">API Foundation</StatusBadge>
            <StatusBadge tone="warning">Workflow Expansion Next</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Sprint 3B menambahkan fondasi end-to-end untuk receiving, putaway, allocation, picking,
          packing, dispatch, stock count, scanning, dan reversal movement. Hub ini mengikat route
          tree baru sekaligus menyiapkan ruang kerja untuk pengembangan transactional flow
          berikutnya.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {operationCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <SurfaceCard className="flex h-full flex-col justify-between gap-4 transition hover:-translate-y-0.5 hover:border-sky-300">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold">{card.label}</p>
                  <StatusBadge tone="neutral">{card.badge}</StatusBadge>
                </div>
                <p className="text-sm leading-6 text-muted">{card.description}</p>
              </div>
              <p className="text-sm font-medium text-sky-700 dark:text-sky-300">Open route</p>
            </SurfaceCard>
          </Link>
        ))}
      </div>

      <SurfaceCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted">Inventory Tie-In</p>
            <h3 className="text-xl font-semibold">
              Allocation and status transfer live under inventory
            </h3>
          </div>
          <StatusBadge tone="neutral">2 supporting routes</StatusBadge>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {inventoryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-2xl border border-slate-200/80 px-4 py-3 text-sm font-medium transition hover:border-sky-300 hover:bg-sky-50/70 dark:border-slate-800 dark:hover:border-sky-900 dark:hover:bg-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
