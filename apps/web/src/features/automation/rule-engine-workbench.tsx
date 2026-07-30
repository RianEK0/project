'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';
import {
  type RuleEngineActionType,
  type RuleEngineEvaluationMode,
  type RuleEngineFactType,
  type RuleEngineOperator,
} from '@nova/shared-types';

import { automationApi } from '@/services/api/automation';

type RulePalettePayload =
  | {
      kind: 'fact';
      value: RuleEngineFactType;
    }
  | {
      kind: 'action';
      value: RuleEngineActionType;
    };

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

function parsePayload(payload: string): RulePalettePayload | null {
  try {
    const parsed = JSON.parse(payload) as RulePalettePayload;

    if (!parsed.kind || !parsed.value) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function RuleEngineWorkbench() {
  const [ruleName, setRuleName] = useState('Low Stock Auto PR');
  const [evaluationMode, setEvaluationMode] = useState<RuleEngineEvaluationMode>('REALTIME');
  const [factType, setFactType] = useState<RuleEngineFactType | null>(null);
  const [operator, setOperator] = useState<RuleEngineOperator>('LESS_THAN');
  const [threshold, setThreshold] = useState('10');
  const [actionType, setActionType] = useState<RuleEngineActionType | null>(null);
  const [actionTarget, setActionTarget] = useState('Director Finance');

  const foundationQuery = useQuery({
    queryKey: ['rule-engine-foundation'],
    queryFn: () => automationApi.getRuleEngine(),
    staleTime: 60_000,
  });

  const previewMutation = useMutation({
    mutationFn: async () => {
      if (!factType || !actionType) {
        throw new Error('Please drop one fact and one action first.');
      }

      return automationApi.previewRuleEngine({
        ruleName,
        factType,
        operator,
        threshold: Number(threshold),
        actionType,
        evaluationMode,
        actionTarget,
      });
    },
  });

  const preview = previewMutation.data?.data;

  const handleDrop = (lane: 'fact' | 'action', payload: string) => {
    const parsed = parsePayload(payload);

    if (!parsed) {
      return;
    }

    if (lane === 'fact' && parsed.kind === 'fact') {
      setFactType(parsed.value);
    }

    if (lane === 'action' && parsed.kind === 'action') {
      setActionType(parsed.value);
    }
  };

  const loadTemplate = (index: number) => {
    const template = foundationQuery.data?.data.templates[index];

    if (!template) {
      return;
    }

    setRuleName(template.name);
    setFactType(template.factType);
    setOperator(template.operator);
    setThreshold(String(template.threshold));
    setActionType(template.actionType);
  };

  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-lime-700 dark:text-lime-300">
              Sprint 13C / Rule Engine
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Business rule engine untuk kondisi IF/THEN seperti stock rendah atau invoice bernilai
              besar
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">IF / THEN Logic</StatusBadge>
            <StatusBadge tone="success">Business Rule</StatusBadge>
            <StatusBadge tone="success">Automation Workspace</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Workbench ini memberi lane rule engine di atas automation foundation. User bisa memilih
          fakta bisnis, operator, threshold, dan action tujuan, lalu NovaERP memberi preview
          skenario yang match, record yang dibuat, jalur routing, dan audit trail sebelum rule
          diaktifkan.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Rule Setup</p>
              <h3 className="text-xl font-semibold">Name, operator, threshold, and mode</h3>
            </div>
            <StatusBadge tone="neutral">{threshold || '0'} threshold</StatusBadge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="font-medium">Rule name</span>
              <input
                value={ruleName}
                onChange={(event) => setRuleName(event.target.value)}
                className="rounded-2xl border bg-transparent px-4 py-3"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Operator</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={operator}
                onChange={(event) => setOperator(event.target.value as RuleEngineOperator)}
              >
                {(foundationQuery.data?.data.operators ?? ['LESS_THAN']).map((item) => (
                  <option key={item} value={item}>
                    {titleCase(item)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Evaluation mode</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={evaluationMode}
                onChange={(event) =>
                  setEvaluationMode(event.target.value as RuleEngineEvaluationMode)
                }
              >
                {(foundationQuery.data?.data.evaluationModes ?? ['REALTIME']).map((item) => (
                  <option key={item} value={item}>
                    {titleCase(item)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Threshold</span>
              <input
                value={threshold}
                onChange={(event) => setThreshold(event.target.value)}
                className="rounded-2xl border bg-transparent px-4 py-3"
                inputMode="numeric"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Action target</span>
              <input
                value={actionTarget}
                onChange={(event) => setActionTarget(event.target.value)}
                className="rounded-2xl border bg-transparent px-4 py-3"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {(foundationQuery.data?.data.templates ?? []).map((template, index) => (
              <button
                key={template.name}
                type="button"
                onClick={() => loadTemplate(index)}
                className="rounded-2xl border px-3 py-2 text-sm font-medium"
              >
                {template.name}
              </button>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Facts</p>
                  <h3 className="text-lg font-semibold">Business signals</h3>
                </div>
                <StatusBadge tone="neutral">
                  {foundationQuery.data?.data.factTypes.length ?? 0}
                </StatusBadge>
              </div>

              {(foundationQuery.data?.data.factTypes ?? []).map((item) => (
                <button
                  key={item}
                  type="button"
                  draggable
                  onDragStart={(event) =>
                    event.dataTransfer.setData(
                      'text/plain',
                      JSON.stringify({ kind: 'fact', value: item }),
                    )
                  }
                  className="w-full rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-left text-sm font-semibold transition hover:border-lime-300 hover:bg-lime-50/70 dark:border-slate-800 dark:bg-slate-950/70 dark:hover:border-lime-900"
                >
                  {titleCase(item)}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Actions</p>
                  <h3 className="text-lg font-semibold">What the rule should do</h3>
                </div>
                <StatusBadge tone="neutral">
                  {foundationQuery.data?.data.actionTypes.length ?? 0}
                </StatusBadge>
              </div>

              {(foundationQuery.data?.data.actionTypes ?? []).map((item) => (
                <button
                  key={item}
                  type="button"
                  draggable
                  onDragStart={(event) =>
                    event.dataTransfer.setData(
                      'text/plain',
                      JSON.stringify({ kind: 'action', value: item }),
                    )
                  }
                  className="w-full rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-left text-sm font-semibold transition hover:border-lime-300 hover:bg-lime-50/70 dark:border-slate-800 dark:bg-slate-950/70 dark:hover:border-lime-900"
                >
                  {titleCase(item)}
                </button>
              ))}
            </div>
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted">Rule Canvas</p>
            <h3 className="text-xl font-semibold">
              Drop one fact into IF and one action into THEN
            </h3>
          </div>
          <button
            type="button"
            onClick={() => previewMutation.mutate()}
            disabled={!factType || !actionType || previewMutation.isPending}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
          >
            {previewMutation.isPending ? 'Preparing rule preview...' : 'Preview rule'}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              handleDrop('fact', event.dataTransfer.getData('text/plain'));
            }}
            className="min-h-[170px] rounded-3xl border border-dashed border-lime-300/80 bg-lime-50/70 p-5 dark:border-lime-900 dark:bg-slate-950/50"
          >
            <p className="text-sm uppercase tracking-[0.16em] text-muted">IF</p>
            <p className="mt-3 text-lg font-semibold">
              {factType ? titleCase(factType) : 'Drop business fact here'}
            </p>
            <p className="mt-2 text-sm text-muted">
              {factType ? `${titleCase(operator)} ${threshold}` : 'Condition fact slot'}
            </p>
          </div>

          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              handleDrop('action', event.dataTransfer.getData('text/plain'));
            }}
            className="min-h-[170px] rounded-3xl border border-dashed border-slate-300/80 bg-slate-50/70 p-5 dark:border-slate-700 dark:bg-slate-950/50"
          >
            <p className="text-sm uppercase tracking-[0.16em] text-muted">THEN</p>
            <p className="mt-3 text-lg font-semibold">
              {actionType ? titleCase(actionType) : 'Drop business action here'}
            </p>
            <p className="mt-2 text-sm text-muted">
              {actionType ? `Target: ${actionTarget}` : 'Action slot'}
            </p>
          </div>
        </div>

        {previewMutation.isError ? (
          <p className="text-sm text-rose-600">{previewMutation.error.message}</p>
        ) : null}
      </SurfaceCard>

      {preview ? (
        <>
          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Rule Preview</p>
                  <h3 className="text-xl font-semibold">{preview.ruleName}</h3>
                </div>
                <StatusBadge tone={statusToneMap[preview.status]}>
                  {titleCase(preview.status)}
                </StatusBadge>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ['Condition', preview.conditionSummary],
                  ['Action', preview.actionSummary],
                  ['Mode', titleCase(preview.evaluationMode)],
                  ['Next evaluation', preview.nextEvaluationAt],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
                    <p className="mt-1 text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Scenario</p>
                <h3 className="text-xl font-semibold">What would happen if the rule matches</h3>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm leading-6 dark:border-slate-800 dark:bg-slate-950/70">
                {preview.matchedScenario}
              </div>

              <div className="rounded-2xl border border-sky-200/80 bg-sky-50/70 px-4 py-3 text-sm dark:border-sky-900/60 dark:bg-sky-950/30">
                {preview.triggeredRecord}
              </div>

              <div className="rounded-2xl border border-slate-200/80 px-4 py-3 text-sm dark:border-slate-800">
                {preview.routingOutcome}
              </div>
            </SurfaceCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <SurfaceCard className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Safeguards</p>
                <h3 className="text-xl font-semibold">Controls before activation</h3>
              </div>

              <div className="grid gap-3">
                {preview.safeguards.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm dark:border-amber-900/60 dark:bg-amber-950/30"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Audit Trail</p>
                <h3 className="text-xl font-semibold">What gets recorded</h3>
              </div>

              <div className="grid gap-3">
                {preview.auditTrail.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200/80 px-4 py-3 text-sm dark:border-slate-800"
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
