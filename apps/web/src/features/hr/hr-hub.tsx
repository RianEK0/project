import Link from 'next/link';

import { StatusBadge, SurfaceCard } from '@nova/ui';

const cards = [
  {
    href: '/app/hr/employees',
    label: 'Employee',
    description: 'Maintain employee master, employment type, status, and onboarding lifecycle.',
    badge: 'People',
  },
  {
    href: '/app/hr/departments',
    label: 'Department',
    description: 'Model department hierarchy, ownership, and reporting alignment across teams.',
    badge: 'Structure',
  },
  {
    href: '/app/hr/attendance',
    label: 'Attendance',
    description: 'Capture presence, lateness, shift alignment, and overtime starter controls.',
    badge: 'Time',
  },
  {
    href: '/app/hr/leave',
    label: 'Leave',
    description: 'Handle entitlement preview, request routing, approval, and balance visibility.',
    badge: 'Policy',
  },
  {
    href: '/app/hr/payroll',
    label: 'Payroll',
    description: 'Prepare payroll cycles, cut-off control, approval, and payout readiness.',
    badge: 'Compensation',
  },
  {
    href: '/app/hr/shifts',
    label: 'Shift',
    description: 'Publish roster foundations for regular, flexible, and multi-shift operations.',
    badge: 'Scheduling',
  },
  {
    href: '/app/hr/recruitment',
    label: 'Recruitment',
    description: 'Track candidates from sourcing through interview, offer, and hiring stages.',
    badge: 'Talent',
  },
  {
    href: '/app/hr/performance',
    label: 'Performance',
    description: 'Prepare review cycles, calibration lanes, and manager feedback visibility.',
    badge: 'Review',
  },
  {
    href: '/app/hr/training',
    label: 'Training',
    description: 'Coordinate mandatory learning, capability development, and program catalog.',
    badge: 'Learning',
  },
  {
    href: '/app/hr/kpis',
    label: 'KPI',
    description: 'Track scorecards, cadence, target ownership, and performance signal alignment.',
    badge: 'Goals',
  },
  {
    href: '/app/hr/organization-chart',
    label: 'Organization Chart',
    description: 'Visualize reporting lines, department structure, and matrix visibility starter.',
    badge: 'Org Design',
  },
] as const;

export function HrHub() {
  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-rose-700 dark:text-rose-300">
              HR / People Operations
            </p>
            <h2 className="font-display text-3xl font-semibold">
              From employee records to payroll, talent growth, and organization clarity
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">People Ready</StatusBadge>
            <StatusBadge tone="success">Payroll Starter</StatusBadge>
            <StatusBadge tone="success">Manager Linked</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          HR / People Operations foundation menambahkan employee, department, attendance, leave,
          payroll, shift, recruitment, performance, training, KPI, dan organization chart tanpa
          menduplikasi role, permission, finance, atau struktur organisasi yang sudah ada di tenant.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <SurfaceCard className="flex h-full flex-col justify-between gap-4 transition hover:-translate-y-0.5 hover:border-rose-300">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold">{card.label}</p>
                  <StatusBadge tone="neutral">{card.badge}</StatusBadge>
                </div>
                <p className="text-sm leading-6 text-muted">{card.description}</p>
              </div>
              <p className="text-sm font-medium text-rose-700 dark:text-rose-300">Open route</p>
            </SurfaceCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
