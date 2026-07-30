import Link from 'next/link';

import { StatusBadge, SurfaceCard } from '@nova/ui';

const cards = [
  {
    href: '/portal/bookings',
    label: 'Bookings',
    description: 'Review upcoming reservations, vouchers, and changes waiting for confirmation.',
    badge: 'Service',
  },
  {
    href: '/portal/orders',
    label: 'Orders',
    description: 'Watch order progress from commercial approval to fulfillment and shipment.',
    badge: 'Commercial',
  },
  {
    href: '/portal/invoices',
    label: 'Invoices',
    description: 'Open invoice detail, due balance, receipt history, and downloadable PDFs.',
    badge: 'Billing',
  },
  {
    href: '/portal/tickets',
    label: 'Tickets',
    description: 'Create and follow support issues tied to booking, order, invoice, or payment.',
    badge: 'Helpdesk',
  },
  {
    href: '/portal/support',
    label: 'Support Center',
    description: 'Find SLA targets, response channels, escalation flows, and service windows.',
    badge: 'Support',
  },
  {
    href: '/portal/downloads',
    label: 'Downloads',
    description: 'Collect invoice PDFs, booking vouchers, payment receipts, and proof documents.',
    badge: 'Docs',
  },
  {
    href: '/portal/payments',
    label: 'Payments',
    description: 'Track open balances, uploaded proof, and settlement verification status.',
    badge: 'Finance',
  },
  {
    href: '/portal/profile',
    label: 'Profile',
    description: 'Update contact details, billing contact, and communication preferences.',
    badge: 'Account',
  },
  {
    href: '/portal/notifications',
    label: 'Notifications',
    description: 'Read booking reminders, invoice alerts, and support updates in one inbox.',
    badge: 'Inbox',
  },
  {
    href: '/portal/tracking',
    label: 'Tracking',
    description: 'Follow milestones across booking, order, payment, shipment, and ticket flows.',
    badge: 'Timeline',
  },
] as const;

export function PortalHub() {
  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
              Customer Portal
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Self-service workspace for bookings, billing, support, and customer documents
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Booking Linked</StatusBadge>
            <StatusBadge tone="success">Support Ready</StatusBadge>
            <StatusBadge tone="success">Finance Linked</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Customer portal foundation memberi pelanggan area yang terpisah dari dashboard internal
          untuk memantau booking, order, invoice, payment, ticket, notifikasi, download dokumen, dan
          tracking timeline tanpa menggandakan source of truth transaksi inti.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <SurfaceCard className="flex h-full flex-col justify-between gap-4 transition hover:-translate-y-0.5 hover:border-emerald-300">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold">{card.label}</p>
                  <StatusBadge tone="neutral">{card.badge}</StatusBadge>
                </div>
                <p className="text-sm leading-6 text-muted">{card.description}</p>
              </div>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Open route
              </p>
            </SurfaceCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
