'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';
import {
  type GlobalEnterpriseDeploymentModel,
  type GlobalEnterpriseScaleDimension,
  type GlobalEnterpriseTopologyMode,
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

export function GlobalEnterpriseWorkbench() {
  const [programName, setProgramName] = useState('NovaERP Global Rollout');
  const [deploymentModel, setDeploymentModel] =
    useState<GlobalEnterpriseDeploymentModel>('GLOBAL_FEDERATION');
  const [topologyMode, setTopologyMode] = useState<GlobalEnterpriseTopologyMode>('REGIONAL_HUBS');
  const [companyCount, setCompanyCount] = useState('1000');
  const [branchCount, setBranchCount] = useState('10000');
  const [userCount, setUserCount] = useState('100000');
  const [unlimitedDimensions, setUnlimitedDimensions] = useState<GlobalEnterpriseScaleDimension[]>([
    'WAREHOUSE',
    'STORE',
    'CURRENCY',
    'LANGUAGE',
    'THEME',
  ]);

  const foundationQuery = useQuery({
    queryKey: ['global-enterprise-foundation'],
    queryFn: () => platformApi.getGlobalEnterprise(),
    staleTime: 60_000,
  });

  const previewMutation = useMutation({
    mutationFn: async () =>
      platformApi.previewGlobalEnterprise({
        programName,
        deploymentModel,
        topologyMode,
        companyCount: Number(companyCount),
        branchCount: Number(branchCount),
        userCount: Number(userCount),
        unlimitedDimensions,
      }),
  });

  const preview = previewMutation.data?.data;

  const toggleUnlimitedDimension = (dimension: GlobalEnterpriseScaleDimension) => {
    setUnlimitedDimensions((current) =>
      current.includes(dimension)
        ? current.filter((item) => item !== dimension)
        : [...current, dimension],
    );
  };

  const loadBlueprint = (title: string) => {
    if (title.includes('Sovereign')) {
      setDeploymentModel('GLOBAL_FEDERATION');
      setTopologyMode('SOVEREIGN_PODS');
      setCompanyCount('320');
      setBranchCount('2400');
      setUserCount('42000');
      return;
    }

    if (title.includes('Retail')) {
      setDeploymentModel('REGIONAL_PARTITION');
      setTopologyMode('HUB_AND_SPOKE');
      setCompanyCount('640');
      setBranchCount('8200');
      setUserCount('76000');
      return;
    }

    setDeploymentModel('GLOBAL_FEDERATION');
    setTopologyMode('REGIONAL_HUBS');
    setCompanyCount('1000');
    setBranchCount('10000');
    setUserCount('100000');
  };

  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">
              Sprint 15A / Global Enterprise
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Simulasikan rollout hyperscale untuk 1.000 company, 10.000 branch, dan 100.000 user
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Global Scale</StatusBadge>
            <StatusBadge tone="success">Regional Pods</StatusBadge>
            <StatusBadge tone="success">Unlimited Surface Policy</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Workbench ini menyiapkan control plane untuk tenant global berskala sangat besar. User
          bisa memodelkan jumlah company, branch, dan user, lalu menandai warehouse, store,
          currency, language, dan theme sebagai lane yang tidak dibatasi secara operasional namun
          tetap dijaga governance-nya.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Scale Setup</p>
              <h3 className="text-xl font-semibold">Topology, deployment, and numeric targets</h3>
            </div>
            <StatusBadge tone="neutral">{unlimitedDimensions.length} unlimited lanes</StatusBadge>
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
              <span className="font-medium">Deployment model</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={deploymentModel}
                onChange={(event) =>
                  setDeploymentModel(event.target.value as GlobalEnterpriseDeploymentModel)
                }
              >
                {(foundationQuery.data?.data.deploymentModels ?? ['GLOBAL_FEDERATION']).map(
                  (model) => (
                    <option key={model} value={model}>
                      {titleCase(model)}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Topology mode</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={topologyMode}
                onChange={(event) =>
                  setTopologyMode(event.target.value as GlobalEnterpriseTopologyMode)
                }
              >
                {(foundationQuery.data?.data.topologyModes ?? ['REGIONAL_HUBS']).map((mode) => (
                  <option key={mode} value={mode}>
                    {titleCase(mode)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Company count</span>
              <input
                type="number"
                min={1}
                value={companyCount}
                onChange={(event) => setCompanyCount(event.target.value)}
                className="rounded-2xl border bg-transparent px-4 py-3"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Branch count</span>
              <input
                type="number"
                min={1}
                value={branchCount}
                onChange={(event) => setBranchCount(event.target.value)}
                className="rounded-2xl border bg-transparent px-4 py-3"
              />
            </label>

            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="font-medium">User count</span>
              <input
                type="number"
                min={1}
                value={userCount}
                onChange={(event) => setUserCount(event.target.value)}
                className="rounded-2xl border bg-transparent px-4 py-3"
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
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Blueprints</p>
              <h3 className="text-xl font-semibold">Load a global enterprise starter pattern</h3>
            </div>
            <StatusBadge tone="neutral">
              {foundationQuery.data?.data.starterBlueprints.length ?? 3} blueprints
            </StatusBadge>
          </div>

          <div className="grid gap-3">
            {(foundationQuery.data?.data.starterBlueprints ?? []).map((blueprint) => (
              <button
                key={blueprint.title}
                type="button"
                onClick={() => loadBlueprint(blueprint.title)}
                className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-left transition hover:border-slate-400 dark:border-slate-800 dark:bg-slate-950/70"
              >
                <p className="text-sm font-semibold">{blueprint.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                  {titleCase(blueprint.deploymentModel)} • {titleCase(blueprint.topologyMode)}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">{blueprint.focus}</p>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.18em] text-muted">Unlimited Lanes</p>
            <div className="grid gap-3 md:grid-cols-2">
              {(foundationQuery.data?.data.unlimitedDimensions ?? []).map((dimension) => {
                const active = unlimitedDimensions.includes(dimension);

                return (
                  <button
                    key={dimension}
                    type="button"
                    onClick={() => toggleUnlimitedDimension(dimension)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      active
                        ? 'border-sky-400 bg-sky-50 text-sky-800 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-200'
                        : 'border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-950/70'
                    }`}
                  >
                    {titleCase(dimension)}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => previewMutation.mutate()}
            disabled={previewMutation.isPending}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
          >
            {previewMutation.isPending
              ? 'Preparing global rollout...'
              : 'Preview global enterprise'}
          </button>

          {previewMutation.isError ? (
            <p className="text-sm text-rose-600">{previewMutation.error.message}</p>
          ) : null}
        </SurfaceCard>
      </div>

      {preview ? (
        <>
          <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Rollout Preview</p>
                  <h3 className="text-xl font-semibold">
                    Outcome for the requested enterprise scale pack
                  </h3>
                </div>
                <StatusBadge tone={statusToneMap[preview.status]}>
                  {preview.status.replaceAll('_', ' ')}
                </StatusBadge>
              </div>

              <p className="text-sm leading-7 text-muted">{preview.summary}</p>

              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ['Companies', preview.companyCount.toLocaleString('en-US')],
                  ['Branches', preview.branchCount.toLocaleString('en-US')],
                  ['Users', preview.userCount.toLocaleString('en-US')],
                  ['Recommended shards', `${preview.recommendedShardCount} pods`],
                  ['Deployment', titleCase(preview.deploymentModel)],
                  ['Rollout date', preview.globalRolloutDate],
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
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Regional Pods</p>
                  <h3 className="text-xl font-semibold">
                    Control-plane distribution recommended by the preview
                  </h3>
                </div>
                <StatusBadge tone="neutral">{preview.regionalPods.length} pods</StatusBadge>
              </div>

              <div className="grid gap-3">
                {preview.regionalPods.map((pod) => (
                  <div
                    key={pod}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm font-medium dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    {pod}
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>

          <SurfaceCard className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Scale Plan</p>
                <h3 className="text-xl font-semibold">
                  Policy treatment for each global enterprise dimension
                </h3>
              </div>
              <StatusBadge tone="neutral">{preview.scalePlan.length} dimensions</StatusBadge>
            </div>

            <div className="grid gap-3">
              {preview.scalePlan.map((item) => (
                <div
                  key={item.dimension}
                  className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{titleCase(item.dimension)}</p>
                    <StatusBadge tone="neutral">{item.target}</StatusBadge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{item.policy}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <div className="grid gap-4 xl:grid-cols-2">
            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">
                    Governance Checks
                  </p>
                  <h3 className="text-xl font-semibold">What still needs controlled rollout</h3>
                </div>
                <StatusBadge tone="neutral">{preview.governanceChecks.length} checks</StatusBadge>
              </div>
              <div className="grid gap-3">
                {preview.governanceChecks.map((check) => (
                  <div
                    key={check}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm leading-6 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    {check}
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">
                    Enablement Tracks
                  </p>
                  <h3 className="text-xl font-semibold">
                    Cross-team streams that support the rollout
                  </h3>
                </div>
                <StatusBadge tone="neutral">{preview.enablementTracks.length} tracks</StatusBadge>
              </div>
              <div className="grid gap-3">
                {preview.enablementTracks.map((track) => (
                  <div
                    key={track}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm leading-6 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    {track}
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
