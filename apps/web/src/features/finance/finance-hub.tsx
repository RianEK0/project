import Link from 'next/link';

import { StatusBadge, SurfaceCard } from '@nova/ui';

const cards = [
  {
    href: '/app/finance/chart-of-accounts',
    label: 'Chart of Account',
    description:
      'Maintain account structure, normal balance, and reporting-ready account grouping.',
    badge: 'Structure',
  },
  {
    href: '/app/finance/general-ledger',
    label: 'General Ledger',
    description: 'Review account movement, running balance, and period-level finance visibility.',
    badge: 'Ledger',
  },
  {
    href: '/app/finance/journals',
    label: 'Journal',
    description: 'Prepare balanced journal entries before posting or reversal is allowed.',
    badge: 'Entry',
  },
  {
    href: '/app/finance/posting',
    label: 'Posting',
    description: 'Control posting batches, readiness gates, and reversal foundations.',
    badge: 'Control',
  },
  {
    href: '/app/finance/vouchers',
    label: 'Voucher',
    description: 'Coordinate payment, receipt, adjustment, and accrual vouchers.',
    badge: 'Document',
  },
  {
    href: '/app/finance/banks',
    label: 'Bank',
    description: 'Manage bank account master data, reconciliation readiness, and treasury context.',
    badge: 'Treasury',
  },
  {
    href: '/app/finance/cash',
    label: 'Cash',
    description: 'Track petty cash, cash drawer, float, and daily cash-control workflows.',
    badge: 'Treasury',
  },
  {
    href: '/app/finance/budgets',
    label: 'Budget',
    description: 'Set budget dimensions, approval flow, locking control, and variance baseline.',
    badge: 'Planning',
  },
  {
    href: '/app/finance/assets',
    label: 'Asset',
    description: 'Maintain fixed asset register, category, in-service, and disposal foundation.',
    badge: 'Asset',
  },
  {
    href: '/app/finance/depreciation',
    label: 'Depreciation',
    description: 'Preview depreciation schedule, run status, and finance recognition starter.',
    badge: 'Asset',
  },
  {
    href: '/app/finance/cost-centers',
    label: 'Cost Center',
    description: 'Model reporting responsibility across division, department, and team layers.',
    badge: 'Dimension',
  },
  {
    href: '/app/finance/fiscal-years',
    label: 'Fiscal Year',
    description: 'Open, soft-close, and close periods with finance checklist visibility.',
    badge: 'Period',
  },
  {
    href: '/app/finance/currencies',
    label: 'Currency',
    description: 'Maintain base and foreign currency availability for finance reporting.',
    badge: 'FX',
  },
  {
    href: '/app/finance/exchange-rates',
    label: 'Exchange Rate',
    description: 'Capture spot, corporate, budget, month-end, and average rate foundations.',
    badge: 'FX',
  },
  {
    href: '/app/finance/financial-statements',
    label: 'Financial Statement',
    description: 'Compose trial balance, general ledger, and finance statement catalog starter.',
    badge: 'Reporting',
  },
  {
    href: '/app/finance/balance-sheet',
    label: 'Balance Sheet',
    description: 'Map assets, liabilities, and equity sections to the reporting layer.',
    badge: 'Reporting',
  },
  {
    href: '/app/finance/profit-loss',
    label: 'Profit Loss',
    description: 'Organize revenue and expense sections for P&L statement visibility.',
    badge: 'Reporting',
  },
  {
    href: '/app/finance/cash-flow',
    label: 'Cash Flow',
    description: 'Separate operating, investing, and financing activity views for finance review.',
    badge: 'Reporting',
  },
] as const;

export function FinanceHub() {
  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
              Finance / Accounting
            </p>
            <h2 className="font-display text-3xl font-semibold">
              From journal control to statements, treasury, and asset reporting foundation
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Sales Linked</StatusBadge>
            <StatusBadge tone="success">Procurement Linked</StatusBadge>
            <StatusBadge tone="success">Multi-Currency Ready</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Finance / Accounting foundation menambahkan chart of account, general ledger, journal,
          posting, voucher, bank, cash, budget, fixed asset, depreciation, cost center, fiscal year,
          currency, exchange rate, dan financial statements tanpa menduplikasi transaksi bisnis yang
          sudah dibangun di sales, procurement, booking, dan payment.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <SurfaceCard className="flex h-full flex-col justify-between gap-4 transition hover:-translate-y-0.5 hover:border-amber-300">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold">{card.label}</p>
                  <StatusBadge tone="neutral">{card.badge}</StatusBadge>
                </div>
                <p className="text-sm leading-6 text-muted">{card.description}</p>
              </div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Open route</p>
            </SurfaceCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
