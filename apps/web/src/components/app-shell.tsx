'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { SurfaceCard, StatusBadge, cn } from '@nova/ui';
import {
  ActivitySquare,
  Bell,
  Boxes,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardList,
  Factory,
  FileText,
  FileSpreadsheet,
  HandCoins,
  IdCard,
  LayoutDashboard,
  Landmark,
  LockKeyhole,
  Package,
  PackageSearch,
  Plug,
  Presentation,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Target,
  Truck,
  Users,
  UsersRound,
  Wallet,
  Warehouse,
  Workflow,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

import { navigationItems } from '@/lib/navigation';
import { LogoutButton } from '@/components/logout-button';
import { NovaLogo } from '@/components/nova-logo';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { useUiStore } from '@/stores/ui-store';

const organizationOptions = ['NovaERP Demo Company', 'Northwind Logistics'];
const workspaceOptions = ['Main Workspace', 'Operations'];

type NavigationIconName = (typeof navigationItems)[number]['icon'];

const iconMap: Record<NavigationIconName, LucideIcon> = {
  ActivitySquare,
  Boxes,
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  ChartNoAxesCombined,
  Factory,
  HandCoins,
  IdCard,
  FileSpreadsheet,
  FileText,
  Landmark,
  Package,
  PackageSearch,
  Plug,
  Presentation,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Target,
  Truck,
  UsersRound,
  Wallet,
  Warehouse,
  Workflow,
  Wrench,
  Building2,
  Users,
  BriefcaseBusiness,
  LockKeyhole,
};

export function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { isSidebarCompact, toggleSidebar } = useUiStore();
  const activeNavigationItem =
    navigationItems.find((item) =>
      item.href === '/app'
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
    ) ?? navigationItems[0];

  return (
    <div className="min-h-screen px-4 py-4 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-4 lg:grid-cols-[280px_1fr]">
        <aside
          className={cn(
            'surface hidden rounded-[28px] border border-white/50 p-4 lg:flex lg:flex-col',
            isSidebarCompact && 'lg:w-[96px]',
          )}
        >
          <div className="mb-6 flex items-center justify-between gap-3 px-2">
            <NovaLogo
              caption={null}
              className="min-w-0"
              markClassName="size-11"
              textClassName={cn(isSidebarCompact && 'hidden')}
            />
            <button
              type="button"
              onClick={toggleSidebar}
              className="rounded-2xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
            >
              {isSidebarCompact ? 'Open' : 'Fold'}
            </button>
          </div>

          <div className="space-y-3">
            {!isSidebarCompact && (
              <>
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  Organization
                </label>
                <select className="w-full rounded-2xl border bg-transparent px-4 py-3 text-sm">
                  {organizationOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <label className="pt-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  Workspace
                </label>
                <select className="w-full rounded-2xl border bg-transparent px-4 py-3 text-sm">
                  {workspaceOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </>
            )}
          </div>

          <nav className="mt-8 flex-1 space-y-1">
            {navigationItems.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive =
                item.href === '/app'
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                    isActive
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900',
                  )}
                >
                  <Icon className="size-4" />
                  {!isSidebarCompact && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="surface rounded-[28px] border border-white/50 p-4 md:p-6">
          <header className="mb-6 flex flex-col gap-4 border-b border-slate-200/70 pb-6 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">
                  {activeNavigationItem.label}
                </p>
                <h1 className="font-display text-3xl font-semibold">
                  {activeNavigationItem.label === 'Dashboard'
                    ? 'Ringkasan workspace'
                    : activeNavigationItem.label}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge tone="success">Demo aktif</StatusBadge>
                <ThemeToggleButton />
                <button
                  type="button"
                  className="inline-flex size-11 items-center justify-center rounded-2xl border"
                >
                  <Bell className="size-4" />
                </button>
                <LogoutButton
                  tone="dashboard"
                  userLabel="owner@novaerp.local"
                  workspaceLabel="Main Workspace"
                />
              </div>
            </div>
            <SurfaceCard className="flex flex-wrap gap-3 border-dashed">
              {[
                ['Perusahaan', 'NovaERP Demo Company'],
                ['Workspace', 'Main Workspace'],
                ['User', 'owner@novaerp.local'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/55"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
                  <p className="mt-1 text-sm font-semibold">{value}</p>
                </div>
              ))}
            </SurfaceCard>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
