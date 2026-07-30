import Link from 'next/link';

import { StatusBadge, SurfaceCard } from '@nova/ui';

import { platformAreaCards, platformCapabilityCatalog } from './platform-capability-catalog';

const workbenchCards = [
  {
    href: '/app/platform/global-enterprise',
    label: 'Global Enterprise',
    description:
      'Model hyperscale rollout for 1,000 companies, 10,000 branches, 100,000 users, and unlimited operational surfaces.',
    badge: 'Scale',
  },
  {
    href: '/app/platform/enterprise-cloud',
    label: 'Enterprise Cloud',
    description:
      'Shape subscription, billing, usage, backup, restore, queue, worker, and scaling services like a modern multi-tenant SaaS platform.',
    badge: 'Cloud',
  },
  {
    href: '/app/platform/devops-platform',
    label: 'DevOps Platform',
    description:
      'Prepare Docker, Kubernetes, Helm, Terraform, CI/CD, and observability rails for safe enterprise delivery.',
    badge: 'DevOps',
  },
  {
    href: '/app/platform/enterprise-security',
    label: 'Enterprise Security',
    description:
      'Roll out zero trust, MFA, passkey, federation, compliance, encryption, and secrets vault controls in one lane.',
    badge: 'Security',
  },
  {
    href: '/app/platform/plugin-marketplace',
    label: 'Plugin Marketplace',
    description:
      'Curate one-click installs for external developer plugins such as POS, hotel, hospital, restaurant, laundry, salon, clinic, and more.',
    badge: 'Marketplace',
  },
  {
    href: '/app/platform/public-api',
    label: 'Public API',
    description:
      'Prepare REST, GraphQL, webhook, and multi-language SDK programs for external developers and partner ecosystems.',
    badge: 'Developer',
  },
  {
    href: '/app/platform/nova-os',
    label: 'NovaOS',
    description:
      'Assemble workflow studio, AI studio, API gateway, feature flags, tenant migration, and real-time collaboration into a platform shell.',
    badge: 'Platform OS',
  },
  {
    href: '/app/platform/low-code-builder',
    label: 'Low Code Builder',
    description:
      'Assemble internal apps with table, form, chart, map, kanban, gallery, and other components in a Retool-style builder.',
    badge: 'Low Code',
  },
  {
    href: '/app/platform/form-builder',
    label: 'Form Builder',
    description:
      'Build forms, surveys, approvals, checklists, inspections, and custom modules without coding.',
    badge: 'No Code',
  },
] as const;

export function PlatformHub() {
  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-700 dark:text-slate-300">
              Platform Workspace
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Enterprise admin control plane for topology, ecosystem, and identity trust
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Enterprise Admin</StatusBadge>
            <StatusBadge tone="success">Preview APIs Wired</StatusBadge>
            <StatusBadge tone="success">Cross-Module Ready</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Workspace ini menyatukan capability enterprise admin seperti multi-company, white label,
          plugin system, audit center, compliance, federation login, hyperscale rollout, enterprise
          cloud, DevOps, enterprise security, NovaOS, developer marketplace, dan public API ke satu
          permukaan kontrol. Tujuannya adalah memberi control plane tanpa menyalin ulang workflow
          organisasi, finance, warehouse, integrasi, audit, low-code app builder, atau no-code
          module builder yang sudah ada.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workbenchCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <SurfaceCard className="flex h-full flex-col justify-between gap-4 transition hover:-translate-y-0.5 hover:border-slate-400">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold">{card.label}</p>
                  <StatusBadge tone="success">{card.badge}</StatusBadge>
                </div>
                <p className="text-sm leading-6 text-muted">{card.description}</p>
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Open workbench
              </p>
            </SurfaceCard>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {platformAreaCards.map((card) => (
          <SurfaceCard key={card.id} className={`space-y-3 border ${card.className}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-semibold">{card.label}</p>
              <StatusBadge tone="neutral">{card.badge}</StatusBadge>
            </div>
            <p className="text-sm leading-6 text-muted">{card.summary}</p>
          </SurfaceCard>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {platformCapabilityCatalog.map((capability) => (
          <Link key={capability.href} href={capability.href}>
            <SurfaceCard
              className={`flex h-full flex-col justify-between gap-4 transition hover:-translate-y-0.5 ${capability.hoverClassName}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-lg font-semibold">{capability.label}</p>
                    <p
                      className={`text-xs uppercase tracking-[0.18em] ${capability.eyebrowClassName}`}
                    >
                      {capability.eyebrow}
                    </p>
                  </div>
                  <StatusBadge tone="neutral">{capability.badge}</StatusBadge>
                </div>
                <p className="text-sm leading-6 text-muted">{capability.description}</p>
              </div>
              <p className={`text-sm font-medium ${capability.actionClassName}`}>Open capability</p>
            </SurfaceCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
