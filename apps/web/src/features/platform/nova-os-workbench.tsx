'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';
import {
  type NovaOsCollaborationMode,
  type NovaOsDeploymentMode,
  type NovaOsStudio,
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

export function NovaOsWorkbench() {
  const [programName, setProgramName] = useState('NovaOS Platform Shell');
  const [deploymentMode, setDeploymentMode] = useState<NovaOsDeploymentMode>('MULTI_REGION_FABRIC');
  const [collaborationMode, setCollaborationMode] =
    useState<NovaOsCollaborationMode>('LIVE_MULTIPLAYER');
  const [regions, setRegions] = useState('jakarta-1, singapore-1');
  const [studios, setStudios] = useState<NovaOsStudio[]>([
    'VISUAL_WORKFLOW_STUDIO',
    'AI_STUDIO',
    'EVENT_BUS',
    'API_GATEWAY',
    'FEATURE_FLAGS',
    'TENANT_MIGRATION',
  ]);

  const foundationQuery = useQuery({
    queryKey: ['nova-os-foundation'],
    queryFn: () => platformApi.getNovaOs(),
    staleTime: 60_000,
  });

  const previewMutation = useMutation({
    mutationFn: async () =>
      platformApi.previewNovaOs({
        programName,
        deploymentMode,
        collaborationMode,
        studios,
        regions: regions
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      }),
  });

  const preview = previewMutation.data?.data;

  const toggleStudio = (studio: NovaOsStudio) => {
    setStudios((current) =>
      current.includes(studio) ? current.filter((item) => item !== studio) : [...current, studio],
    );
  };

  const loadTrack = (title: string) => {
    if (title.includes('Sovereign')) {
      setDeploymentMode('SOVEREIGN_FABRIC');
      setCollaborationMode('HYBRID_SESSION');
      setRegions('jakarta-1, singapore-1, frankfurt-1');
      return;
    }

    if (title.includes('Product')) {
      setDeploymentMode('SINGLE_CONTROL_PLANE');
      setCollaborationMode('ASYNC_REVIEW');
      setRegions('jakarta-1');
      return;
    }

    setDeploymentMode('MULTI_REGION_FABRIC');
    setCollaborationMode('LIVE_MULTIPLAYER');
    setRegions('jakarta-1, singapore-1');
  };

  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
              Sprint 20 / NovaOS
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Bentuk NovaERP menjadi platform lengkap dengan studio, event bus, API gateway, dan
              tenant migration
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Workflow Studio</StatusBadge>
            <StatusBadge tone="success">API Gateway</StatusBadge>
            <StatusBadge tone="success">Feature Flags</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          NovaOS menjadi tahap akhir untuk menjadikan NovaERP sebagai platform yang bisa dibangun
          ulang di atas dirinya sendiri: visual workflow studio, AI studio, extension marketplace,
          white label, observability center, real-time collaboration, dan tenant migration tools.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Platform Shape</p>
              <h3 className="text-xl font-semibold">
                Choose deployment, collaboration, and regions
              </h3>
            </div>
            <StatusBadge tone="neutral">{studios.length} studios active</StatusBadge>
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
              <span className="font-medium">Deployment mode</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={deploymentMode}
                onChange={(event) => setDeploymentMode(event.target.value as NovaOsDeploymentMode)}
              >
                {(foundationQuery.data?.data.deploymentModes ?? ['MULTI_REGION_FABRIC']).map(
                  (mode) => (
                    <option key={mode} value={mode}>
                      {titleCase(mode)}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Collaboration mode</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={collaborationMode}
                onChange={(event) =>
                  setCollaborationMode(event.target.value as NovaOsCollaborationMode)
                }
              >
                {(foundationQuery.data?.data.collaborationModes ?? ['LIVE_MULTIPLAYER']).map(
                  (mode) => (
                    <option key={mode} value={mode}>
                      {titleCase(mode)}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="font-medium">Regions</span>
              <input
                value={regions}
                onChange={(event) => setRegions(event.target.value)}
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

          <button
            type="button"
            onClick={() => previewMutation.mutate()}
            disabled={studios.length === 0 || previewMutation.isPending}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
          >
            {previewMutation.isPending ? 'Preparing NovaOS preview...' : 'Preview NovaOS'}
          </button>

          {previewMutation.isError ? (
            <p className="text-sm text-rose-600">{previewMutation.error.message}</p>
          ) : null}
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Studios</p>
              <h3 className="text-xl font-semibold">
                Choose the platform surfaces NovaOS should expose
              </h3>
            </div>
            <StatusBadge tone="neutral">
              {foundationQuery.data?.data.studios.length ?? 13} studios
            </StatusBadge>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(foundationQuery.data?.data.studios ?? []).map((studio) => {
              const selected = studios.includes(studio);

              return (
                <button
                  key={studio}
                  type="button"
                  onClick={() => toggleStudio(studio)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    selected
                      ? 'border-amber-400 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100'
                      : 'border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-950/70'
                  }`}
                >
                  <p className="text-sm font-semibold">{titleCase(studio)}</p>
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm uppercase tracking-[0.18em] text-muted">Starter Tracks</p>
              <StatusBadge tone="neutral">
                {foundationQuery.data?.data.starterTracks.length ?? 3} tracks
              </StatusBadge>
            </div>
            <div className="grid gap-3">
              {(foundationQuery.data?.data.starterTracks ?? []).map((track) => (
                <button
                  key={track.title}
                  type="button"
                  onClick={() => loadTrack(track.title)}
                  className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-left transition hover:border-slate-400 dark:border-slate-800 dark:bg-slate-950/70"
                >
                  <p className="text-sm font-semibold">{track.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                    {titleCase(track.deploymentMode)} • {titleCase(track.collaborationMode)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">{track.focus}</p>
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
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">OS Preview</p>
                  <h3 className="text-xl font-semibold">
                    What the current platform shell will unlock
                  </h3>
                </div>
                <StatusBadge tone={statusToneMap[preview.status]}>
                  {preview.status.replaceAll('_', ' ')}
                </StatusBadge>
              </div>

              <p className="text-sm leading-7 text-muted">{preview.summary}</p>

              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ['Deployment', titleCase(preview.deploymentMode)],
                  ['Collaboration', titleCase(preview.collaborationMode)],
                  ['Event bus', preview.eventBusMode],
                  ['API gateway', preview.apiGatewayProfile],
                  ['Feature flags', preview.featureFlagStrategy],
                  ['Migration wave', preview.migrationWaveDate],
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
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Runtime Surfaces</p>
                  <h3 className="text-xl font-semibold">Studios and operating lanes to expect</h3>
                </div>
                <StatusBadge tone="neutral">{preview.runtimeSurfaces.length} surfaces</StatusBadge>
              </div>

              <div className="grid gap-3">
                {preview.runtimeSurfaces.map((item) => (
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

          <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">
                    Launch Milestones
                  </p>
                  <h3 className="text-xl font-semibold">
                    Sequence the rollout without losing control
                  </h3>
                </div>
                <StatusBadge tone="neutral">
                  {preview.launchMilestones.length} milestones
                </StatusBadge>
              </div>

              <div className="grid gap-3">
                {preview.launchMilestones.map((item) => (
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
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Governance Hooks</p>
                  <h3 className="text-xl font-semibold">
                    Controls that keep NovaOS safe to extend
                  </h3>
                </div>
                <StatusBadge tone="neutral">{preview.governanceHooks.length} hooks</StatusBadge>
              </div>

              <div className="grid gap-3">
                {preview.governanceHooks.map((item) => (
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
