'use client';

import { useTheme } from 'next-themes';

import { StatusBadge, SurfaceCard } from '@nova/ui';

import { ThemeToggleButton } from '@/components/theme-toggle-button';

export function ThemeModePanel() {
  const { resolvedTheme, theme } = useTheme();

  return (
    <SurfaceCard className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-muted">Theme Control</p>
          <h3 className="text-xl font-semibold">Dark mode is active across the dashboard shell</h3>
        </div>
        <StatusBadge tone={resolvedTheme === 'dark' ? 'success' : 'neutral'}>
          {resolvedTheme === 'dark' ? 'Dark Active' : 'Light Active'}
        </StatusBadge>
      </div>
      <p className="text-sm leading-6 text-muted">
        Current preference: <span className="font-semibold">{theme ?? 'system'}</span>. Toggle the
        mode here or from the main app shell header.
      </p>
      <div className="flex items-center gap-3">
        <ThemeToggleButton />
        <p className="text-sm text-muted">Tap the theme button to switch between light and dark.</p>
      </div>
    </SurfaceCard>
  );
}
