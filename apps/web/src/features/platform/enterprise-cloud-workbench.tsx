'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';
import {
  type EnterpriseCloudRegionStrategy,
  type EnterpriseCloudServiceLane,
  type EnterpriseCloudTenancyMode,
} from '@nova/shared-types';

import { platformApi } from '@/services/api/platform';

const statusToneMap = {
  DRAFT: 'neutral',
  READY: 'success',
  REVIEW_NEEDED: 'warning',
} as const;

function titleCase(value: string) {
  return value
    .replaceAll('_', ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function EnterpriseCloudWorkbench() {
  const [programName, setProgramName] = useState('NovaERP Enterprise Cloud');
  const [tenancyMode, setTenancyMode] = useState<EnterpriseCloudTenancyMode>('HYBRID_RESIDENCY');
  const [regionStrategy, setRegionStrategy] = useState<EnterpriseCloudRegionStrategy>(
    'ACTIVE_ACTIVE_MULTI_REGION',
  );
  const [tenantCount, setTenantCount] = useState('1800');
  const [regions, setRegions] = useState('jakarta-1, singapore-1, frankfurt-1');
  const [enabledLanes, setEnabledLanes] = useState<EnterpriseCloudServiceLane[]>([
    'SUBSCRIPTION',
    'BILLING',
    'BACKUP',
    'RESTORE',
    'MONITORING',
    'SECURITY',
    'SCALING',
  ]);

  const foundationQuery = useQuery({
    queryKey: ['enterprise-cloud-foundation'],
    queryFn: () => platformApi.getEnterpriseCloud(),
    staleTime: 60_000,
  });

  const previewMutation = useMutation({
    mutationFn: async () =>
      platformApi.previewEnterpriseCloud({
        programName,
        tenancyMode,
        regionStrategy,
        tenantCount: Number(tenantCount),
        regions: regions
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        enabledLanes,
      }),
  });

  const preview = previewMutation.data?.data;

  const toggleLane = (lane: EnterpriseCloudServiceLane) => {
    setEnabledLanes((current) =>
      current.includes(lane) ? current.filter((item) => item !== lane) : [...current, lane],
    );
  };

  const loadProfile = (title: string) => {
    if (title.includes('Regional')) {
      setTenancyMode('SHARED_SAAS');
      setRegionStrategy('ACTIVE_PASSIVE_MULTI_REGION');
      setTenantCount('1200');
      setRegions('jakarta-1, singapore-1');
      return;
    }

    if (title.includes('Residency')) {
      setTenancyMode('DEDICATED_ENTERPRISE');
      setRegionStrategy('SINGLE_REGION');
      setTenantCount('240');
      setRegions('jakarta-1');
      return;
    }

    setTenancyMode('HYBRID_RESIDENCY');
    setRegionStrategy('ACTIVE_ACTIVE_MULTI_REGION');
    setTenantCount('1800');
    setRegions('jakarta-1, singapore-1, frankfurt-1');
  };

  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">
              Sprint 16 / Enterprise Cloud
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Rancang control plane SaaS untuk subscription, billing, usage, region, backup, dan
              scaling
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">SaaS Billing</StatusBadge>
            <StatusBadge tone="success">Regional Runtime</StatusBadge>
            <StatusBadge tone="success">Restore Ready</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Workbench ini menyatukan fondasi subscription, billing, usage metering, tenant control,
          region, backup, restore, monitoring, audit, security, CDN, storage, queue, worker, dan
          scaling agar NovaERP terasa seperti SaaS enterprise besar.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Cloud Program</p>
              <h3 className="text-xl font-semibold">Tenant shape, region strategy, and scope</h3>
            </div>
            <StatusBadge tone="neutral">{enabledLanes.length} lanes enabled</StatusBadge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="font-medium">Program name</span>
              <input
                value={programName}
                onChange={(event) => setProgramName(event.target.value)}
                className="rounded-2xl border bg-transparent px-4 py-3"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Tenancy mode</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={tenancyMode}
                onChange={(event) =>
                  setTenancyMode(event.target.value as EnterpriseCloudTenancyMode)
                }
              >
                {(foundationQuery.data?.data.tenancyModes ?? ['HYBRID_RESIDENCY']).map((mode) => (
                  <option key={mode} value={mode}>
                    {titleCase(mode)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Region strategy</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={regionStrategy}
                onChange={(event) =>
                  setRegionStrategy(event.target.value as EnterpriseCloudRegionStrategy)
                }
              >
                {(
                  foundationQuery.data?.data.regionStrategies ?? ['ACTIVE_ACTIVE_MULTI_REGION']
                ).map((strategy) => (
                  <option key={strategy} value={strategy}>
                    {titleCase(strategy)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Tenant count</span>
              <input
                type="number"
                min={1}
                value={tenantCount}
                onChange={(event) => setTenantCount(event.target.value)}
                className="rounded-2xl border bg-transparent px-4 py-3"
              />
            </label>

            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="font-medium">Regions</span>
              <input
                value={regions}
                onChange={(event) => setRegions(event.target.value)}
                className="rounded-2xl border bg-transparent px-4 py-3"
                placeholder="jakarta-1, singapore-1, frankfurt-1"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {(foundationQuery.data?.data.recommendedRegions ?? []).map((region) => (
              <StatusBadge key={region} tone="neutral">
                {region}
              </StatusBadge>
            ))}
          </div>

          <button
            type="button"
            onClick={() => previewMutation.mutate()}
            disabled={enabledLanes.length === 0 || previewMutation.isPending}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
          >
            {previewMutation.isPending
              ? 'Preparing enterprise cloud plan...'
              : 'Preview enterprise cloud'}
          </button>

          {previewMutation.isError ? (
            <p className="text-sm text-rose-600">{previewMutation.error.message}</p>
          ) : null}
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Service Lanes</p>
              <h3 className="text-xl font-semibold">Toggle the cloud capabilities you want live</h3>
            </div>
            <StatusBadge tone="neutral">
              {foundationQuery.data?.data.serviceLanes.length ?? 15} lanes
            </StatusBadge>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(foundationQuery.data?.data.serviceLanes ?? []).map((lane) => {
              const selected = enabledLanes.includes(lane);

              return (
                <button
                  key={lane}
                  type="button"
                  onClick={() => toggleLane(lane)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    selected
                      ? 'border-sky-400 bg-sky-50 text-sky-900 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-100'
                      : 'border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-950/70'
                  }`}
                >
                  <p className="text-sm font-semibold">{titleCase(lane)}</p>
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm uppercase tracking-[0.18em] text-muted">Starter Profiles</p>
              <StatusBadge tone="neutral">
                {foundationQuery.data?.data.starterProfiles.length ?? 3} profiles
              </StatusBadge>
            </div>
            <div className="grid gap-3">
              {(foundationQuery.data?.data.starterProfiles ?? []).map((profile) => (
                <button
                  key={profile.title}
                  type="button"
                  onClick={() => loadProfile(profile.title)}
                  className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-left transition hover:border-slate-400 dark:border-slate-800 dark:bg-slate-950/70"
                >
                  <p className="text-sm font-semibold">{profile.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                    {titleCase(profile.tenancyMode)} • {titleCase(profile.regionStrategy)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">{profile.focus}</p>
                </button>
              ))}
            </div>
          </div>
        </SurfaceCard>
      </div>

      {preview ? (
        <>
          <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Launch Preview</p>
                  <h3 className="text-xl font-semibold">
                    What the current SaaS cloud plan unlocks
                  </h3>
                </div>
                <StatusBadge tone={statusToneMap[preview.status]}>
                  {preview.status.replaceAll('_', ' ')}
                </StatusBadge>
              </div>

              <p className="text-sm leading-7 text-muted">{preview.summary}</p>

              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ['Tenancy', titleCase(preview.tenancyMode)],
                  ['Regions', `${preview.regions.length} active`],
                  ['Tenant count', preview.tenantCount.toLocaleString('en-US')],
                  ['Billing forecast', preview.monthlyBillingForecast],
                  ['Backup RPO', `${preview.backupRpoMinutes} minutes`],
                  ['Restore RTO', `${preview.restoreRtoMinutes} minutes`],
                  ['Launch date', preview.scaleReadinessDate],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
                    <p className="mt-1 text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Service Owners</p>
                  <h3 className="text-xl font-semibold">Operational policy per enabled lane</h3>
                </div>
                <StatusBadge tone="neutral">{preview.servicePlans.length} plans</StatusBadge>
              </div>

              <div className="grid gap-3">
                {preview.servicePlans.map((plan) => (
                  <div
                    key={plan.lane}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{titleCase(plan.lane)}</p>
                      <StatusBadge tone="neutral">{plan.owner}</StatusBadge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">{plan.policy}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Guardrails</p>
                  <h3 className="text-xl font-semibold">Checks to keep SaaS operations safe</h3>
                </div>
                <StatusBadge tone="neutral">
                  {preview.operationalGuardrails.length} checks
                </StatusBadge>
              </div>

              <div className="grid gap-3">
                {preview.operationalGuardrails.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm leading-6 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Observability</p>
                  <h3 className="text-xl font-semibold">
                    Monitoring stack that should ship with cloud rollout
                  </h3>
                </div>
                <StatusBadge tone="neutral">{preview.observabilityStack.length} items</StatusBadge>
              </div>

              <div className="grid gap-3">
                {preview.observabilityStack.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm leading-6 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>
        </>
      ) : null}
    </div>
  );
}
