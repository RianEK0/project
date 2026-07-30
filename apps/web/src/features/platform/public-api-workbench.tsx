'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';
import { type PublicApiProtocol, type PublicApiSdkLanguage } from '@nova/shared-types';

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

export function PublicApiWorkbench() {
  const [programName, setProgramName] = useState('NovaERP Developer Platform');
  const [protocol, setProtocol] = useState<PublicApiProtocol>('REST');
  const [sdkLanguage, setSdkLanguage] = useState<PublicApiSdkLanguage>('TYPESCRIPT');
  const [domain, setDomain] = useState('Procurement');
  const [webhookEvents, setWebhookEvents] = useState<string[]>(['purchase.order.approved']);

  const foundationQuery = useQuery({
    queryKey: ['public-api-foundation'],
    queryFn: () => platformApi.getPublicApi(),
    staleTime: 60_000,
  });

  const previewMutation = useMutation({
    mutationFn: async () =>
      platformApi.previewPublicApi({
        programName,
        protocol,
        sdkLanguage: protocol === 'SDK' ? sdkLanguage : null,
        domain,
        webhookEvents: protocol === 'WEBHOOK' ? webhookEvents : [],
      }),
  });

  const preview = previewMutation.data?.data;

  const toggleWebhookEvent = (eventName: string) => {
    setWebhookEvents((current) =>
      current.includes(eventName)
        ? current.filter((item) => item !== eventName)
        : [...current, eventName],
    );
  };

  const loadStarterBundle = (protocolValue: PublicApiProtocol) => {
    setProtocol(protocolValue);

    if (protocolValue === 'SDK') {
      setSdkLanguage('TYPESCRIPT');
    }

    if (protocolValue === 'WEBHOOK') {
      setWebhookEvents(['purchase.order.approved', 'inventory.stock.low']);
    }
  };

  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-700 dark:text-slate-300">
              Sprint 15C / Public API
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Siapkan REST, GraphQL, webhook, dan SDK untuk developer platform NovaERP
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">REST + GraphQL</StatusBadge>
            <StatusBadge tone="success">Webhook</StatusBadge>
            <StatusBadge tone="success">SDK Multi Language</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Workbench ini membuka lane developer platform untuk public API dan SDK lintas bahasa. User
          bisa memodelkan protokol utama, memilih domain yang diekspos, menandai event webhook, lalu
          melihat bundle artefak, auth mode, dan checklist publish yang diperlukan.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">API Setup</p>
              <h3 className="text-xl font-semibold">Protocol, domain, SDK, and event selection</h3>
            </div>
            <StatusBadge tone="neutral">{protocol}</StatusBadge>
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
              <span className="font-medium">Protocol</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={protocol}
                onChange={(event) => setProtocol(event.target.value as PublicApiProtocol)}
              >
                {(foundationQuery.data?.data.protocols ?? ['REST']).map((item) => (
                  <option key={item} value={item}>
                    {titleCase(item)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Domain</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
              >
                {(foundationQuery.data?.data.sampleDomains ?? ['Procurement']).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            {protocol === 'SDK' ? (
              <label className="grid gap-2 text-sm md:col-span-2">
                <span className="font-medium">SDK language</span>
                <select
                  className="rounded-2xl border bg-transparent px-4 py-3"
                  value={sdkLanguage}
                  onChange={(event) => setSdkLanguage(event.target.value as PublicApiSdkLanguage)}
                >
                  {(foundationQuery.data?.data.sdkLanguages ?? ['TYPESCRIPT']).map((item) => (
                    <option key={item} value={item}>
                      {titleCase(item)}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>

          {protocol === 'WEBHOOK' ? (
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.18em] text-muted">Webhook Events</p>
              <div className="grid gap-3 md:grid-cols-2">
                {(foundationQuery.data?.data.webhookEvents ?? []).map((eventName) => {
                  const selected = webhookEvents.includes(eventName);

                  return (
                    <button
                      key={eventName}
                      type="button"
                      onClick={() => toggleWebhookEvent(eventName)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        selected
                          ? 'border-slate-400 bg-slate-100 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100'
                          : 'border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-950/70'
                      }`}
                    >
                      {eventName}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => previewMutation.mutate()}
            disabled={previewMutation.isPending}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
          >
            {previewMutation.isPending ? 'Preparing developer program...' : 'Preview public API'}
          </button>

          {previewMutation.isError ? (
            <p className="text-sm text-rose-600">{previewMutation.error.message}</p>
          ) : null}
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Starter Bundles</p>
              <h3 className="text-xl font-semibold">
                Quick protocol bundles for developer platform rollout
              </h3>
            </div>
            <StatusBadge tone="neutral">
              {foundationQuery.data?.data.starterBundles.length ?? 3} bundles
            </StatusBadge>
          </div>

          <div className="grid gap-3">
            {(foundationQuery.data?.data.starterBundles ?? []).map((bundle) => (
              <button
                key={bundle.title}
                type="button"
                onClick={() => loadStarterBundle(bundle.protocol)}
                className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-left transition hover:border-slate-400 dark:border-slate-800 dark:bg-slate-950/70"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{bundle.title}</p>
                  <StatusBadge tone="neutral">{bundle.protocol}</StatusBadge>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">{bundle.focus}</p>
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {(foundationQuery.data?.data.authModes ?? []).map((mode) => (
              <div
                key={mode}
                className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm font-medium dark:border-slate-800 dark:bg-slate-950/70"
              >
                {titleCase(mode)}
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      {preview ? (
        <>
          <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">
                    Developer Program Preview
                  </p>
                  <h3 className="text-xl font-semibold">
                    Release posture for the selected public API protocol
                  </h3>
                </div>
                <StatusBadge tone={statusToneMap[preview.status]}>
                  {preview.status.replaceAll('_', ' ')}
                </StatusBadge>
              </div>

              <p className="text-sm leading-7 text-muted">{preview.summary}</p>

              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ['Protocol', titleCase(preview.protocol)],
                  ['Domain', preview.domain],
                  ['Base URL', preview.baseUrl],
                  ['Auth mode', titleCase(preview.authMode)],
                  ['Rate limit', preview.rateLimitProfile],
                  ['Publish window', preview.publishWindowDate],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
                    <p className="mt-1 text-sm font-medium break-words">{value}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Artifacts</p>
                  <h3 className="text-xl font-semibold">
                    Deliverables that go out with this protocol pack
                  </h3>
                </div>
                <StatusBadge tone="neutral">{preview.artifactBundle.length} assets</StatusBadge>
              </div>

              <div className="grid gap-3">
                {preview.artifactBundle.map((artifact) => (
                  <div
                    key={artifact}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    {artifact}
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70">
                <p className="text-xs uppercase tracking-[0.16em] text-muted">Sample operation</p>
                <p className="mt-1 text-sm font-medium break-words">{preview.sampleOperation}</p>
              </div>

              {preview.sdkPackageName ? (
                <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">SDK package</p>
                  <p className="mt-1 text-sm font-medium">{preview.sdkPackageName}</p>
                </div>
              ) : null}
            </SurfaceCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Webhook Events</p>
                  <h3 className="text-xl font-semibold">Event set attached to this preview</h3>
                </div>
                <StatusBadge tone="neutral">{preview.webhookEvents.length} events</StatusBadge>
              </div>
              <div className="grid gap-3">
                {preview.webhookEvents.length > 0 ? (
                  preview.webhookEvents.map((eventName) => (
                    <div
                      key={eventName}
                      className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950/70"
                    >
                      {eventName}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm text-muted dark:border-slate-800 dark:bg-slate-950/70">
                    No webhook event bundle selected for this protocol.
                  </div>
                )}
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Guardrails</p>
                  <h3 className="text-xl font-semibold">Policies that keep public access safe</h3>
                </div>
                <StatusBadge tone="neutral">{preview.guardrails.length} guardrails</StatusBadge>
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

            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">
                    Enablement Checklist
                  </p>
                  <h3 className="text-xl font-semibold">
                    Release items before external developers onboard
                  </h3>
                </div>
                <StatusBadge tone="neutral">
                  {preview.enablementChecklist.length} checklist items
                </StatusBadge>
              </div>
              <div className="grid gap-3">
                {preview.enablementChecklist.map((item) => (
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
