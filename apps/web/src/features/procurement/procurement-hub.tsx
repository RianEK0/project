import Link from 'next/link';

import { StatusBadge, SurfaceCard } from '@nova/ui';

const cards = [
  {
    href: '/app/procurement/requests',
    label: 'Purchase Requests',
    description: 'Capture employee or replenishment demand before sourcing begins.',
    badge: 'Entry Point',
  },
  {
    href: '/app/procurement/approvals',
    label: 'Approvals',
    description: 'Handle request, comparison, and PO approval handoffs with clear decisions.',
    badge: 'Control',
  },
  {
    href: '/app/procurement/rfqs',
    label: 'RFQ',
    description: 'Coordinate supplier outreach and sourcing rounds before vendor selection.',
    badge: 'Sourcing',
  },
  {
    href: '/app/procurement/quotations',
    label: 'Supplier Quotations',
    description: 'Collect quoted price, lead time, and commercial terms from suppliers.',
    badge: 'Sourcing',
  },
  {
    href: '/app/procurement/comparisons',
    label: 'Vendor Comparison',
    description: 'Score quotations by cost, lead time, quality, and historical on-time rate.',
    badge: 'Decision',
  },
  {
    href: '/app/procurement/orders',
    label: 'Purchase Orders',
    description: 'Create approved purchase commitments and track partial receive to close.',
    badge: 'Commitment',
  },
  {
    href: '/app/procurement/blanket-orders',
    label: 'Blanket Orders',
    description:
      'Maintain repeat-buy release foundations before deeper finance consumption matures.',
    badge: 'Agreement',
  },
  {
    href: '/app/procurement/contracts',
    label: 'Purchase Contracts',
    description: 'Track procurement agreements that can feed PO releases in future slices.',
    badge: 'Agreement',
  },
  {
    href: '/app/procurement/receipts',
    label: 'Purchase Receive',
    description:
      'Bridge approved PO demand into the shared goods receipt and warehouse inbound flow.',
    badge: 'Inbound',
  },
  {
    href: '/app/procurement/invoice-preparation',
    label: 'Invoice Preparation',
    description:
      'Prepare procurement-side invoice context before journal, voucher, and AP posting workflows take over.',
    badge: 'Finance Handoff',
  },
  {
    href: '/app/procurement/vendors/performance',
    label: 'Vendor Performance',
    description: 'Review vendor rating, lead time trend, price history, and repeat-buy confidence.',
    badge: 'Insight',
  },
  {
    href: '/app/procurement/analytics',
    label: 'Purchase Analytics',
    description: 'Read request funnel, sourcing funnel, PO flow, and invoice prep starter metrics.',
    badge: 'Analytics',
  },
] as const;

export function ProcurementHub() {
  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">
              Procurement
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Purchase orchestration with finance handoff readiness
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Supplier Ready</StatusBadge>
            <StatusBadge tone="success">Warehouse Linked</StatusBadge>
            <StatusBadge tone="success">Finance Foundation Ready</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Procurement foundation Sprint 3C menyambungkan purchase request, RFQ, quotation, vendor
          comparison, purchase order, receipt orchestration, invoice preparation, dan vendor
          analytics tanpa menduplikasi supplier, goods receipt, atau invoice domain yang sudah ada.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
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
    </div>
  );
}
