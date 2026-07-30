import Link from 'next/link';

import { StatusBadge, SurfaceCard } from '@nova/ui';

const cards = [
  {
    href: '/app/crm/leads',
    label: 'Leads',
    description:
      'Capture inbound prospects from phone, email, WhatsApp, referral, or manual entry.',
    badge: 'Entry',
  },
  {
    href: '/app/crm/opportunities',
    label: 'Opportunities',
    description: 'Move qualified demand into structured commercial pursuit and stage ownership.',
    badge: 'Pursuit',
  },
  {
    href: '/app/crm/deals',
    label: 'Deals',
    description: 'Track commercial commitment, negotiation pressure, and close outcomes.',
    badge: 'Commercial',
  },
  {
    href: '/app/crm/activities',
    label: 'Activities',
    description: 'Record sales work across calls, follow ups, meetings, reminders, and notes.',
    badge: 'Execution',
  },
  {
    href: '/app/crm/quotations',
    label: 'Quotations',
    description: 'Manage proposals before invoicing or downstream fulfillment takes over.',
    badge: 'Proposal',
  },
  {
    href: '/app/crm/pipeline',
    label: 'Pipeline',
    description: 'Watch weighted revenue potential by stage and spot stalled commercial motion.',
    badge: 'Forecast',
  },
  {
    href: '/app/crm/funnel',
    label: 'Sales Funnel',
    description: 'Read lead-to-win conversion flow from acquisition through negotiation.',
    badge: 'Conversion',
  },
  {
    href: '/app/crm/timeline',
    label: 'Customer Timeline',
    description: 'See communication and sales milestones in one event stream for context.',
    badge: 'Context',
  },
  {
    href: '/app/crm/tasks',
    label: 'Tasks and Follow Up',
    description: 'Keep reps accountable for next action, reminder windows, and meeting prep.',
    badge: 'Action',
  },
  {
    href: '/app/crm/dashboard',
    label: 'Sales Dashboard',
    description: 'Review new leads, active opportunities, quotations, and weighted pipeline.',
    badge: 'Analytics',
  },
] as const;

export function CrmHub() {
  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">
              CRM / Sales
            </p>
            <h2 className="font-display text-3xl font-semibold">
              From first lead to won deal with full customer context
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Customer Linked</StatusBadge>
            <StatusBadge tone="success">Timeline Ready</StatusBadge>
            <StatusBadge tone="success">Finance Ready</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          CRM/Sales foundation menambahkan lead, opportunity, deal, quotation, activity stream, call
          log, email, WhatsApp, task, reminder, follow up, meeting, pipeline, funnel, dan customer
          timeline tanpa menggandakan customer master atau invoice domain yang sudah ada.
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
