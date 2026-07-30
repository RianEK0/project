'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { SurfaceCard, StatusBadge, cn } from '@nova/ui';
import {
  Bell,
  ClipboardList,
  Download,
  LayoutDashboard,
  LifeBuoy,
  ReceiptText,
  ShoppingCart,
  Ticket,
  Truck,
  UserRound,
  Wallet,
} from 'lucide-react';

import { NovaLogo } from '@/components/nova-logo';
import { LogoutButton } from '@/components/logout-button';
import { portalNavigationItems } from '@/lib/portal-navigation';

const iconMap = {
  LayoutDashboard,
  ClipboardList,
  ShoppingCart,
  ReceiptText,
  Ticket,
  LifeBuoy,
  Download,
  Wallet,
  UserRound,
  Bell,
  Truck,
};

export function CustomerPortalShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const activeNavigationItem =
    portalNavigationItems.find((item) =>
      item.href === '/portal'
        ? pathname === item.href || pathname === '/portal/dashboard'
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
    ) ?? portalNavigationItems[0];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_36%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(240,253,250,0.9))] px-4 py-4 dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_32%),linear-gradient(180deg,_rgba(2,6,23,1),_rgba(15,23,42,1))] md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-4 lg:grid-cols-[300px_1fr]">
        <aside className="surface hidden rounded-[28px] border border-white/50 p-5 lg:flex lg:flex-col">
          <div className="space-y-5">
            <NovaLogo caption={null} />

            <SurfaceCard className="space-y-3 border-dashed">
              <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/55">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Account</p>
                <p className="mt-1 text-sm font-semibold">casey@portal.novaerp.local</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/55">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Workspace</p>
                <p className="mt-1 text-sm font-semibold">Northwind Logistics</p>
              </div>
              <StatusBadge tone="success">Portal aktif</StatusBadge>
            </SurfaceCard>
          </div>

          <nav className="mt-8 flex-1 space-y-1">
            {portalNavigationItems.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive =
                item.href === '/portal'
                  ? pathname === item.href || pathname === '/portal/dashboard'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:bg-emerald-50 dark:text-slate-300 dark:hover:bg-slate-900',
                  )}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <SurfaceCard className="space-y-3 bg-emerald-50/70 dark:bg-emerald-950/20">
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Butuh bantuan</p>
            <Link
              href="/portal/support"
              className="inline-flex rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
            >
              Buka support
            </Link>
          </SurfaceCard>
        </aside>

        <main className="surface rounded-[28px] border border-white/50 p-4 md:p-6">
          <div className="mb-5 space-y-3 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <NovaLogo caption={null} />
              <StatusBadge tone="success">Portal aktif</StatusBadge>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {portalNavigationItems.map((item) => {
                const isActive =
                  item.href === '/portal'
                    ? pathname === item.href || pathname === '/portal/dashboard'
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium',
                      isActive
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-200 dark:border-slate-800',
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <header className="mb-6 space-y-4 border-b border-slate-200/70 pb-6 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">
                  {activeNavigationItem.label}
                </p>
                <h2 className="font-display text-3xl font-semibold">
                  {activeNavigationItem.label}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone="success">Portal aktif</StatusBadge>
                <LogoutButton
                  tone="portal"
                  userLabel="casey@portal.novaerp.local"
                  workspaceLabel="Northwind Logistics"
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <SurfaceCard className="space-y-1 border-dashed">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Owner</p>
                <p className="text-base font-semibold">Casey Portal</p>
              </SurfaceCard>
              <SurfaceCard className="space-y-1 border-dashed">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Contract</p>
                <p className="text-base font-semibold">Enterprise Service Plan</p>
              </SurfaceCard>
              <SurfaceCard className="space-y-1 border-dashed">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Support</p>
                <p className="text-base font-semibold">4h first response</p>
              </SurfaceCard>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
