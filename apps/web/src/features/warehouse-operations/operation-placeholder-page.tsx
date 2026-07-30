import Link from 'next/link';

import { SurfaceCard, StatusBadge } from '@nova/ui';

import { SectionPlaceholder } from '@/features/sprint-two/section-placeholder';

type RelatedLink = {
  href: string;
  label: string;
};

type OperationPlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  highlights: readonly string[];
  relatedLinks?: readonly RelatedLink[];
  badgeLabel?: string;
};

export function OperationPlaceholderPage({
  eyebrow,
  title,
  description,
  highlights,
  relatedLinks = [],
  badgeLabel = 'Sprint 3B Foundation',
}: OperationPlaceholderPageProps) {
  return (
    <div className="space-y-4">
      <SectionPlaceholder
        eyebrow={eyebrow}
        title={title}
        description={description}
        highlights={highlights}
        badgeLabel={badgeLabel}
      />

      {relatedLinks.length > 0 ? (
        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Rute terkait</p>
              <h3 className="text-xl font-semibold">Lanjut ke jalur warehouse</h3>
            </div>
            <StatusBadge tone="neutral">{relatedLinks.length} jalur</StatusBadge>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {relatedLinks.map((link) => (
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
      ) : null}
    </div>
  );
}
