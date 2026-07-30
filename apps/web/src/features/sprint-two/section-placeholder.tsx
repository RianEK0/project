import { SurfaceCard, StatusBadge } from '@nova/ui';

import { compactCopy } from '@/lib/compact-copy';

type SectionPlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  highlights: readonly string[];
  badgeLabel?: string;
};

export function SectionPlaceholder({
  eyebrow,
  title,
  description,
  highlights,
  badgeLabel = 'Sprint 2 Foundation',
}: SectionPlaceholderProps) {
  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-4 rounded-[34px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1.5">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">
              {eyebrow}
            </p>
            <h2 className="font-display text-3xl font-semibold">{title}</h2>
          </div>
          <StatusBadge tone="success">{badgeLabel}</StatusBadge>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-muted">{compactCopy(description, 128)}</p>
      </SurfaceCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {highlights.map((highlight, index) => (
          <SurfaceCard key={highlight} className="min-h-28 rounded-[28px] space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              {String(index + 1).padStart(2, '0')}
            </p>
            <p className="text-base font-semibold leading-7">{highlight}</p>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}
