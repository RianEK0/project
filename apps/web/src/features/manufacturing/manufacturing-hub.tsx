import Link from 'next/link';

import { StatusBadge, SurfaceCard } from '@nova/ui';

const cards = [
  {
    href: '/app/manufacturing/bill-of-materials',
    label: 'Bill of Material',
    description: 'Maintain multi-level BOM structure, revision control, and component explosion.',
    badge: 'Structure',
  },
  {
    href: '/app/manufacturing/production',
    label: 'Production',
    description: 'Track production orders from release through execution and closure.',
    badge: 'Execution',
  },
  {
    href: '/app/manufacturing/work-orders',
    label: 'Work Order',
    description: 'Coordinate shop-floor orders with readiness, status, and completion visibility.',
    badge: 'Shop Floor',
  },
  {
    href: '/app/manufacturing/routing',
    label: 'Routing',
    description: 'Define operation sequence, setup, run time, and inspection handoff points.',
    badge: 'Method',
  },
  {
    href: '/app/manufacturing/machines',
    label: 'Machine',
    description: 'Manage machine availability, assignment, and work-center context.',
    badge: 'Asset',
  },
  {
    href: '/app/manufacturing/maintenance',
    label: 'Maintenance',
    description: 'Plan preventive and corrective maintenance to protect production continuity.',
    badge: 'Reliability',
  },
  {
    href: '/app/manufacturing/quality-control',
    label: 'Quality Control',
    description: 'Capture inspection checkpoints, decisions, rework, and disposition flow.',
    badge: 'Quality',
  },
  {
    href: '/app/manufacturing/scrap',
    label: 'Scrap',
    description: 'Record process loss, rejected output, and variance reasons for analysis.',
    badge: 'Loss',
  },
  {
    href: '/app/manufacturing/planning',
    label: 'Production Planning',
    description: 'Organize planning horizon, release rules, and frozen-window discipline.',
    badge: 'Plan',
  },
  {
    href: '/app/manufacturing/mrp',
    label: 'MRP',
    description: 'Preview shortages, lot-sized replenishment, and supply recommendation signals.',
    badge: 'Supply',
  },
  {
    href: '/app/manufacturing/capacity-planning',
    label: 'Capacity Planning',
    description: 'Balance work-center load against available hours and overtime buffer.',
    badge: 'Capacity',
  },
] as const;

export function ManufacturingHub() {
  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-orange-700 dark:text-orange-300">
              Manufacturing / Production Operations
            </p>
            <h2 className="font-display text-3xl font-semibold">
              From BOM and routing to MRP, capacity, quality, and shop-floor readiness
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Inventory Linked</StatusBadge>
            <StatusBadge tone="success">Planning Ready</StatusBadge>
            <StatusBadge tone="success">Quality Starter</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Manufacturing / Production Operations foundation menambahkan bill of material, production,
          work order, routing, machine, maintenance, quality control, scrap, production planning,
          MRP, dan capacity planning tanpa menduplikasi inventory, procurement, finance, atau HR
          bounded context yang sudah ada.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <SurfaceCard className="flex h-full flex-col justify-between gap-4 transition hover:-translate-y-0.5 hover:border-orange-300">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold">{card.label}</p>
                  <StatusBadge tone="neutral">{card.badge}</StatusBadge>
                </div>
                <p className="text-sm leading-6 text-muted">{card.description}</p>
              </div>
              <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Open route</p>
            </SurfaceCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
