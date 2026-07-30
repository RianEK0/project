'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';
import {
  type DevOpsDeploymentTarget,
  type DevOpsObservabilityTool,
  type DevOpsPipelineProvider,
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

export function DevopsPlatformWorkbench() {
  const [programName, setProgramName] = useState('NovaERP Delivery Platform');
  const [deploymentTarget, setDeploymentTarget] = useState<DevOpsDeploymentTarget>('KUBERNETES');
  const [pipelineProvider, setPipelineProvider] =
    useState<DevOpsPipelineProvider>('GITHUB_ACTIONS');
  const [environments, setEnvironments] = useState('development, staging, production');
  const [observabilityTools, setObservabilityTools] = useState<DevOpsObservabilityTool[]>([
    'GRAFANA',
    'PROMETHEUS',
    'SENTRY',
    'OPENTELEMETRY',
  ]);

  const foundationQuery = useQuery({
    queryKey: ['devops-platform-foundation'],
    queryFn: () => platformApi.getDevopsPlatform(),
    staleTime: 60_000,
  });

  const previewMutation = useMutation({
    mutationFn: async () =>
      platformApi.previewDevopsPlatform({
        programName,
        deploymentTarget,
        pipelineProvider,
        environments: environments
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        observabilityTools,
      }),
  });

  const preview = previewMutation.data?.data;

  const toggleTool = (tool: DevOpsObservabilityTool) => {
    setObservabilityTools((current) =>
      current.includes(tool) ? current.filter((item) => item !== tool) : [...current, tool],
    );
  };

  const loadProgram = (title: string) => {
    if (title.includes('Hybrid')) {
      setDeploymentTarget('HYBRID_EDGE');
      setPipelineProvider('HYBRID_CI');
      setEnvironments('development, staging, production, edge-validation');
      return;
    }

    if (title.includes('Container')) {
      setDeploymentTarget('DOCKER_COMPOSE');
      setPipelineProvider('GITLAB_CI');
      setEnvironments('development, staging');
      return;
    }

    setDeploymentTarget('KUBERNETES');
    setPipelineProvider('GITHUB_ACTIONS');
    setEnvironments('development, staging, production');
  };

  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
              Sprint 17 / DevOps Platform
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Satukan Docker, Kubernetes, Helm, Terraform, CI/CD, dan observability untuk delivery
              NovaERP
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Kubernetes</StatusBadge>
            <StatusBadge tone="success">Terraform</StatusBadge>
            <StatusBadge tone="success">OpenTelemetry</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Workbench ini merangkum fondasi delivery engineering NovaERP: Docker, Kubernetes, Helm,
          Terraform, GitHub Actions, GitLab CI, monitoring, Grafana, Prometheus, ELK, Sentry, dan
          OpenTelemetry ke satu jalur platform yang bisa dipreview.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Delivery Setup</p>
              <h3 className="text-xl font-semibold">
                Choose deployment target, pipeline, and environments
              </h3>
            </div>
            <StatusBadge tone="neutral">{observabilityTools.length} tools active</StatusBadge>
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
              <span className="font-medium">Deployment target</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={deploymentTarget}
                onChange={(event) =>
                  setDeploymentTarget(event.target.value as DevOpsDeploymentTarget)
                }
              >
                {(foundationQuery.data?.data.deploymentTargets ?? ['KUBERNETES']).map((target) => (
                  <option key={target} value={target}>
                    {titleCase(target)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Pipeline provider</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={pipelineProvider}
                onChange={(event) =>
                  setPipelineProvider(event.target.value as DevOpsPipelineProvider)
                }
              >
                {(foundationQuery.data?.data.pipelineProviders ?? ['GITHUB_ACTIONS']).map(
                  (provider) => (
                    <option key={provider} value={provider}>
                      {titleCase(provider)}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="font-medium">Environments</span>
              <input
                value={environments}
                onChange={(event) => setEnvironments(event.target.value)}
                className="rounded-2xl border bg-transparent px-4 py-3"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {(foundationQuery.data?.data.infrastructureLayers ?? []).map((layer) => (
              <StatusBadge key={layer} tone="neutral">
                {layer}
              </StatusBadge>
            ))}
          </div>

          <button
            type="button"
            onClick={() => previewMutation.mutate()}
            disabled={observabilityTools.length === 0 || previewMutation.isPending}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
          >
            {previewMutation.isPending
              ? 'Preparing delivery preview...'
              : 'Preview DevOps platform'}
          </button>

          {previewMutation.isError ? (
            <p className="text-sm text-rose-600">{previewMutation.error.message}</p>
          ) : null}
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Observability Stack</p>
              <h3 className="text-xl font-semibold">
                Select the tooling that guards every release
              </h3>
            </div>
            <StatusBadge tone="neutral">
              {foundationQuery.data?.data.observabilityTools.length ?? 5} tools
            </StatusBadge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {(foundationQuery.data?.data.observabilityTools ?? []).map((tool) => {
              const selected = observabilityTools.includes(tool);

              return (
                <button
                  key={tool}
                  type="button"
                  onClick={() => toggleTool(tool)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    selected
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100'
                      : 'border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-950/70'
                  }`}
                >
                  <p className="text-sm font-semibold">{titleCase(tool)}</p>
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm uppercase tracking-[0.18em] text-muted">Starter Programs</p>
              <StatusBadge tone="neutral">
                {foundationQuery.data?.data.starterPrograms.length ?? 3} programs
              </StatusBadge>
            </div>
            <div className="grid gap-3">
              {(foundationQuery.data?.data.starterPrograms ?? []).map((program) => (
                <button
                  key={program.title}
                  type="button"
                  onClick={() => loadProgram(program.title)}
                  className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-left transition hover:border-slate-400 dark:border-slate-800 dark:bg-slate-950/70"
                >
                  <p className="text-sm font-semibold">{program.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                    {titleCase(program.deploymentTarget)} • {titleCase(program.pipelineProvider)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">{program.focus}</p>
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
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Release Preview</p>
                  <h3 className="text-xl font-semibold">
                    Current delivery posture for the selected platform
                  </h3>
                </div>
                <StatusBadge tone={statusToneMap[preview.status]}>
                  {preview.status.replaceAll('_', ' ')}
                </StatusBadge>
              </div>

              <p className="text-sm leading-7 text-muted">{preview.summary}</p>

              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ['Target', titleCase(preview.deploymentTarget)],
                  ['Pipeline', titleCase(preview.pipelineProvider)],
                  ['Clusters', `${preview.clusterCount}`],
                  ['Helm charts', `${preview.helmChartCount}`],
                  ['Terraform workspaces', `${preview.terraformWorkspaceCount}`],
                  ['Launch date', preview.releaseReadinessDate],
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
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Delivery Stages</p>
                  <h3 className="text-xl font-semibold">
                    Release gates that should remain visible
                  </h3>
                </div>
                <StatusBadge tone="neutral">{preview.deliveryStages.length} stages</StatusBadge>
              </div>

              <div className="grid gap-3">
                {preview.deliveryStages.map((item) => (
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
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Coverage</p>
                  <h3 className="text-xl font-semibold">
                    What the current observability stack covers
                  </h3>
                </div>
                <StatusBadge tone="neutral">
                  {preview.observabilityCoverage.length} items
                </StatusBadge>
              </div>

              <div className="grid gap-3">
                {preview.observabilityCoverage.map((item) => (
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
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Guardrails</p>
                  <h3 className="text-xl font-semibold">
                    Rules to keep releases boring in production
                  </h3>
                </div>
                <StatusBadge tone="neutral">{preview.guardrails.length} checks</StatusBadge>
              </div>

              <div className="grid gap-3">
                {preview.guardrails.map((item) => (
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
