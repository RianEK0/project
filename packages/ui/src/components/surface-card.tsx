import type { HTMLAttributes } from 'react';

import { cn } from '../lib/cn';

type SurfaceCardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: 'default' | 'accent';
};

export function SurfaceCard({
  className,
  tone = 'default',
  ...props
}: SurfaceCardProps) {
  return (
    <div
      className={cn(
        'rounded-3xl border p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)]',
        tone === 'default' &&
          'border-slate-200/80 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80',
        tone === 'accent' &&
          'border-sky-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:border-sky-900/60 dark:from-slate-950 dark:via-slate-950 dark:to-sky-950/40',
        className,
      )}
      {...props}
    />
  );
}

