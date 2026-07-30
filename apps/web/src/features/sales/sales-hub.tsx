import Link from 'next/link';

import { StatusBadge, SurfaceCard } from '@nova/ui';

const cards = [
  {
    href: '/app/sales/orders',
    label: 'Sales Orders',
    description: 'Convert quotation or direct demand into an executable commercial order.',
    badge: 'Commitment',
  },
  {
    href: '/app/sales/quotations',
    label: 'Quotations',
    description: 'Reuse CRM quotation lifecycle as the commercial source before order release.',
    badge: 'Shared',
  },
  {
    href: '/app/sales/invoices',
    label: 'Sales Invoices',
    description: 'Prepare invoice release and collection visibility from completed order flow.',
    badge: 'Billing',
  },
  {
    href: '/app/sales/delivery-orders',
    label: 'Delivery Orders',
    description: 'Authorize fulfillment and coordinate warehouse handoff per committed order.',
    badge: 'Fulfillment',
  },
  {
    href: '/app/sales/shipments',
    label: 'Shipments',
    description: 'Track proof of delivery, in-transit risk, and final handoff to customers.',
    badge: 'Logistics',
  },
  {
    href: '/app/sales/returns',
    label: 'Returns',
    description: 'Manage customer returns before refund or credit note handling takes over.',
    badge: 'After Sales',
  },
  {
    href: '/app/sales/credit-notes',
    label: 'Credit Notes',
    description: 'Handle commercial corrections after return acceptance or invoice adjustment.',
    badge: 'Correction',
  },
  {
    href: '/app/sales/discount-engine',
    label: 'Discount Engine',
    description: 'Evaluate tiered, percentage, fixed, and buy-x-get-y discount scenarios.',
    badge: 'Pricing',
  },
  {
    href: '/app/sales/tax-engine',
    label: 'Tax Engine',
    description: 'Calculate exclusive, inclusive, zero-rated, and exempt sales tax outcomes.',
    badge: 'Tax',
  },
  {
    href: '/app/sales/price-lists',
    label: 'Price Lists',
    description: 'Coordinate standard, customer-specific, channel, and contract selling prices.',
    badge: 'Pricing',
  },
  {
    href: '/app/sales/customer-credit',
    label: 'Customer Credit',
    description: 'Watch limit utilization, overdue exposure, and approval readiness per customer.',
    badge: 'Risk',
  },
  {
    href: '/app/sales/installments',
    label: 'Installments',
    description: 'Plan billing schedules for staged payments without full AR automation yet.',
    badge: 'Collections',
  },
  {
    href: '/app/sales/analytics',
    label: 'Sales Analytics',
    description:
      'Read fill rate, invoice rate, collection rate, return rate, and open order value.',
    badge: 'Analytics',
  },
] as const;

export function SalesHub() {
  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">
              Sales / Order-to-Cash
            </p>
            <h2 className="font-display text-3xl font-semibold">
              From commercial commitment to delivery, invoice, and return handling
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">CRM Shared</StatusBadge>
            <StatusBadge tone="success">Warehouse Linked</StatusBadge>
            <StatusBadge tone="success">Finance Foundation Ready</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Sales / Order-to-Cash foundation menyambungkan quotation CRM ke sales order, delivery,
          shipment, invoice orchestration, return, credit note, discount, tax, price list, customer
          credit, installment, dan sales analytics tanpa menggandakan fulfillment warehouse atau
          engine invoice yang sudah ada.
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
