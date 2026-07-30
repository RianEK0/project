'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';
import {
  type EnterpriseSecurityFramework,
  type EnterpriseSecurityIdentityMode,
  type EnterpriseSecurityTrustMode,
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

export function EnterpriseSecurityWorkbench() {
  const [programName, setProgramName] = useState('NovaERP Security Hardening');
  const [trustMode, setTrustMode] = useState<EnterpriseSecurityTrustMode>('ZERO_TRUST_FOUNDATION');
  const [identityMode, setIdentityMode] =
    useState<EnterpriseSecurityIdentityMode>('MFA_AND_PASSKEY');
  const [frameworks, setFrameworks] = useState<EnterpriseSecurityFramework[]>([
    'SOC2_READY',
    'ISO27001_READY',
  ]);
  const [enabledControls, setEnabledControls] = useState<string[]>([
    'ZERO_TRUST',
    'MFA',
    'PASSKEY',
    'SSO',
    'AUDIT_CENTER',
    'SECRETS_VAULT',
  ]);

  const foundationQuery = useQuery({
    queryKey: ['enterprise-security-foundation'],
    queryFn: () => platformApi.getEnterpriseSecurity(),
    staleTime: 60_000,
  });

  const previewMutation = useMutation({
    mutationFn: async () =>
      platformApi.previewEnterpriseSecurity({
        programName,
        trustMode,
        identityMode,
        frameworks,
        enabledControls,
      }),
  });

  const preview = previewMutation.data?.data;

  const toggleFramework = (framework: EnterpriseSecurityFramework) => {
    setFrameworks((current) =>
      current.includes(framework)
        ? current.filter((item) => item !== framework)
        : [...current, framework],
    );
  };

  const toggleControl = (control: string) => {
    setEnabledControls((current) =>
      current.includes(control)
        ? current.filter((item) => item !== control)
        : [...current, control],
    );
  };

  const loadPolicy = (title: string) => {
    if (title.includes('Federated')) {
      setTrustMode('ADAPTIVE_ENTERPRISE');
      setIdentityMode('SSO_FEDERATION');
      setFrameworks(['SOC2_READY', 'GDPR']);
      return;
    }

    if (title.includes('Regulated')) {
      setTrustMode('SOVEREIGN_REGULATED');
      setIdentityMode('WORKFORCE_DEVICE_POSTURE');
      setFrameworks(['ISO27001_READY', 'PDPA']);
      return;
    }

    setTrustMode('ZERO_TRUST_FOUNDATION');
    setIdentityMode('MFA_AND_PASSKEY');
    setFrameworks(['SOC2_READY', 'ISO27001_READY']);
  };

  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-rose-700 dark:text-rose-300">
              Sprint 18 / Enterprise Security
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Rancang zero trust, MFA, passkey, federation, compliance, dan secrets vault untuk
              enterprise
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Zero Trust</StatusBadge>
            <StatusBadge tone="success">Passkey</StatusBadge>
            <StatusBadge tone="success">SOC2 Ready</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Workbench ini memusatkan jalur keamanan enterprise NovaERP: zero trust, MFA, passkey, SSO,
          OAuth, SAML, device management, IP restriction, audit center, compliance, encryption, dan
          secrets vault sebagai fondasi Sprint 18.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Security Program</p>
              <h3 className="text-xl font-semibold">
                Trust posture, identity mode, and frameworks
              </h3>
            </div>
            <StatusBadge tone="neutral">{frameworks.length} frameworks</StatusBadge>
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
              <span className="font-medium">Trust mode</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={trustMode}
                onChange={(event) =>
                  setTrustMode(event.target.value as EnterpriseSecurityTrustMode)
                }
              >
                {(foundationQuery.data?.data.trustModes ?? ['ZERO_TRUST_FOUNDATION']).map(
                  (mode) => (
                    <option key={mode} value={mode}>
                      {titleCase(mode)}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Identity mode</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={identityMode}
                onChange={(event) =>
                  setIdentityMode(event.target.value as EnterpriseSecurityIdentityMode)
                }
              >
                {(foundationQuery.data?.data.identityModes ?? ['MFA_AND_PASSKEY']).map((mode) => (
                  <option key={mode} value={mode}>
                    {titleCase(mode)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm uppercase tracking-[0.18em] text-muted">Compliance Tracks</p>
              <StatusBadge tone="neutral">
                {foundationQuery.data?.data.frameworks.length ?? 4} frameworks
              </StatusBadge>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {(foundationQuery.data?.data.frameworks ?? []).map((framework) => {
                const selected = frameworks.includes(framework);

                return (
                  <button
                    key={framework}
                    type="button"
                    onClick={() => toggleFramework(framework)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      selected
                        ? 'border-rose-400 bg-rose-50 text-rose-900 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-100'
                        : 'border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-950/70'
                    }`}
                  >
                    <p className="text-sm font-semibold">{titleCase(framework)}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => previewMutation.mutate()}
            disabled={
              frameworks.length === 0 || enabledControls.length === 0 || previewMutation.isPending
            }
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
          >
            {previewMutation.isPending
              ? 'Preparing security rollout...'
              : 'Preview enterprise security'}
          </button>

          {previewMutation.isError ? (
            <p className="text-sm text-rose-600">{previewMutation.error.message}</p>
          ) : null}
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Control Lanes</p>
              <h3 className="text-xl font-semibold">
                Pick the controls that must land in Sprint 18
              </h3>
            </div>
            <StatusBadge tone="neutral">{enabledControls.length} controls</StatusBadge>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(foundationQuery.data?.data.controlLanes ?? []).map((control) => {
              const selected = enabledControls.includes(control);

              return (
                <button
                  key={control}
                  type="button"
                  onClick={() => toggleControl(control)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    selected
                      ? 'border-rose-400 bg-rose-50 text-rose-900 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-100'
                      : 'border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-950/70'
                  }`}
                >
                  <p className="text-sm font-semibold">{titleCase(control)}</p>
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm uppercase tracking-[0.18em] text-muted">Starter Policies</p>
              <StatusBadge tone="neutral">
                {foundationQuery.data?.data.starterPolicies.length ?? 3} packs
              </StatusBadge>
            </div>
            <div className="grid gap-3">
              {(foundationQuery.data?.data.starterPolicies ?? []).map((policy) => (
                <button
                  key={policy.title}
                  type="button"
                  onClick={() => loadPolicy(policy.title)}
                  className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-left transition hover:border-slate-400 dark:border-slate-800 dark:bg-slate-950/70"
                >
                  <p className="text-sm font-semibold">{policy.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                    {titleCase(policy.trustMode)} • {titleCase(policy.identityMode)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">{policy.focus}</p>
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
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Security Preview</p>
                  <h3 className="text-xl font-semibold">
                    What the current security posture delivers
                  </h3>
                </div>
                <StatusBadge tone={statusToneMap[preview.status]}>
                  {preview.status.replaceAll('_', ' ')}
                </StatusBadge>
              </div>

              <p className="text-sm leading-7 text-muted">{preview.summary}</p>

              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ['Trust mode', titleCase(preview.trustMode)],
                  ['Identity mode', titleCase(preview.identityMode)],
                  ['MFA coverage', `${preview.mfaCoveragePct}%`],
                  ['Passkey rollout', `${preview.passkeyRolloutPct}%`],
                  ['Audit retention', `${preview.auditRetentionDays} days`],
                  ['Secrets vault', preview.secretsVaultMode],
                  ['Launch date', preview.securityReadinessDate],
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
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Control Checks</p>
                  <h3 className="text-xl font-semibold">
                    Operational expectations per enabled control
                  </h3>
                </div>
                <StatusBadge tone="neutral">{preview.controlChecks.length} checks</StatusBadge>
              </div>

              <div className="grid gap-3">
                {preview.controlChecks.map((check) => (
                  <div
                    key={check.control}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{titleCase(check.control)}</p>
                      <StatusBadge tone="neutral">{check.owner}</StatusBadge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">{check.expectation}</p>
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
                    Compliance Tracks
                  </p>
                  <h3 className="text-xl font-semibold">
                    Framework outcomes supported by the rollout
                  </h3>
                </div>
                <StatusBadge tone="neutral">{preview.complianceTracks.length} tracks</StatusBadge>
              </div>

              <div className="grid gap-3">
                {preview.complianceTracks.map((item) => (
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
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Policy Actions</p>
                  <h3 className="text-xl font-semibold">
                    What the security team should enforce next
                  </h3>
                </div>
                <StatusBadge tone="neutral">{preview.policyActions.length} actions</StatusBadge>
              </div>

              <div className="grid gap-3">
                {preview.policyActions.map((item) => (
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
