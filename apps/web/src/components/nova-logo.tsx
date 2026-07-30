import { useId } from 'react';

import { cn } from '@nova/ui';

type NovaLogoMarkProps = {
  className?: string;
};

type NovaLogoProps = {
  badge?: string | null;
  caption?: string | null;
  className?: string;
  markClassName?: string;
  textClassName?: string;
};

export function NovaLogoMark({ className }: NovaLogoMarkProps) {
  const id = useId();

  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="NovaERP"
      className={cn('size-11 shrink-0', className)}
    >
      <defs>
        <linearGradient
          id={`${id}-shell`}
          x1="8"
          y1="6"
          x2="56"
          y2="58"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#071827" />
          <stop offset="1" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient
          id={`${id}-core`}
          x1="14"
          y1="12"
          x2="52"
          y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0f1e33" />
          <stop offset="1" stopColor="#13233b" />
        </linearGradient>
        <linearGradient
          id={`${id}-accent`}
          x1="20"
          y1="18"
          x2="45"
          y2="41"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#67e8f9" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
        <radialGradient
          id={`${id}-orb`}
          cx="0"
          cy="0"
          r="1"
          gradientTransform="translate(49 15) rotate(90) scale(11)"
        >
          <stop stopColor="#a5f3fc" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0.15" />
        </radialGradient>
      </defs>
      <rect width="64" height="64" rx="20" fill={`url(#${id}-shell)`} />
      <rect x="7" y="7" width="50" height="50" rx="16" fill={`url(#${id}-core)`} stroke="#1e293b" />
      <path d="M16 16h32" stroke="#38bdf8" strokeOpacity="0.16" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M18 46V18h7l16 18.5V18h6v28h-7L24 27.8V46h-6Z"
        fill="#f8fbff"
      />
      <path d="M23 19h6l13 15.5v7h-6L23 26.1V19Z" fill={`url(#${id}-accent)`} />
      <path d="M17 48h30" stroke="#f8fbff" strokeOpacity="0.12" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="49" cy="15" r="4.5" fill="#7dd3fc" />
      <circle cx="49" cy="15" r="11" fill={`url(#${id}-orb)`} />
    </svg>
  );
}

export function NovaLogo({
  badge = null,
  caption = null,
  className,
  markClassName,
  textClassName,
}: NovaLogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <NovaLogoMark className={markClassName} />
      <div className={cn('min-w-0', textClassName)}>
        <div className="flex items-center gap-2">
          <p className="font-display text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            NovaERP
          </p>
          {badge ? (
            <span className="rounded-full border border-sky-200/70 bg-sky-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-700 dark:border-sky-900/60 dark:text-sky-300">
              {badge}
            </span>
          ) : null}
        </div>
        {caption ? <p className="text-sm text-muted">{caption}</p> : null}
      </div>
    </div>
  );
}
