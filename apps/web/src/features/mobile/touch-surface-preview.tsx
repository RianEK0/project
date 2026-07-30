import Link from 'next/link';

import { StatusBadge, SurfaceCard } from '@nova/ui';

import { type MobileCapabilitySlug } from './mobile-capability-catalog';

type TouchCapabilitySlug = Extract<MobileCapabilitySlug, 'tablet-ui' | 'warehouse-ui'>;

const touchActions = {
  'tablet-ui': [
    { href: '/app/dashboards/warehouse', label: 'Warehouse Dashboard' },
    { href: '/app/warehouse-operations/receipts', label: 'Receiving Board' },
    { href: '/app/warehouse-operations/dispatch', label: 'Dispatch Board' },
    { href: '/app/warehouse-operations/stock-counts', label: 'Stock Count Board' },
  ],
  'warehouse-ui': [
    { href: '/app/warehouse-operations/scan', label: 'Scan' },
    { href: '/app/warehouse-operations/picking', label: 'Picking Queue' },
    { href: '/app/warehouse-operations/putaway', label: 'Putaway Queue' },
    { href: '/app/warehouse-operations/tasks/my-tasks', label: 'My Tasks' },
  ],
} as const satisfies Record<TouchCapabilitySlug, ReadonlyArray<{ href: string; label: string }>>;

export function TouchSurfacePreview({ capabilitySlug }: { capabilitySlug: MobileCapabilitySlug }) {
  if (capabilitySlug !== 'tablet-ui' && capabilitySlug !== 'warehouse-ui') {
    return null;
  }

  const actions = touchActions[capabilitySlug];

  return (
    <SurfaceCard className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-muted">Touch Layout</p>
          <h3 className="text-xl font-semibold">Large targets for tablet and handheld execution</h3>
        </div>
        <StatusBadge tone="neutral">{actions.length} touch actions</StatusBadge>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-[24px] border border-slate-200/80 bg-white/80 px-5 py-6 text-base font-semibold transition hover:border-slate-400 dark:border-slate-800 dark:bg-slate-950/80"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </SurfaceCard>
  );
}
