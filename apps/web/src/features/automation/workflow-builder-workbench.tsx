'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';
import {
  type WorkflowBuilderEventKey,
  type WorkflowBuilderExecutionMode,
  type WorkflowBuilderStepType,
} from '@nova/shared-types';

import { automationApi } from '@/services/api/automation';

type WorkflowPalettePayload =
  | {
      kind: 'event';
      eventKey: WorkflowBuilderEventKey;
    }
  | {
      kind: 'step';
      stepType: WorkflowBuilderStepType;
      label: string;
    };

type WorkflowActionSlot = {
  id: string;
  label: string;
  stepType: WorkflowBuilderStepType | null;
  stepLabel: string | null;
};

const statusToneMap = {
  DRAFT: 'neutral',
  READY: 'success',
  REVIEW_NEEDED: 'warning',
} as const;

const actionSlotsTemplate: WorkflowActionSlot[] = [
  { id: 'step-1', label: 'Action 1', stepType: null, stepLabel: null },
  { id: 'step-2', label: 'Action 2', stepType: null, stepLabel: null },
  { id: 'step-3', label: 'Action 3', stepType: null, stepLabel: null },
  { id: 'step-4', label: 'Action 4', stepType: null, stepLabel: null },
  { id: 'step-5', label: 'Action 5', stepType: null, stepLabel: null },
  { id: 'step-6', label: 'Action 6', stepType: null, stepLabel: null },
  { id: 'step-7', label: 'Action 7', stepType: null, stepLabel: null },
];

function titleCase(value: string) {
  return value
    .replaceAll('_', ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function parseWorkflowPayload(payload: string): WorkflowPalettePayload | null {
  try {
    const parsed = JSON.parse(payload) as WorkflowPalettePayload;

    if (parsed.kind === 'event' && parsed.eventKey) {
      return parsed;
    }
    if (parsed.kind === 'step' && parsed.stepType && parsed.label) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

export function WorkflowBuilderWorkbench() {
  const [workflowName, setWorkflowName] = useState('PO Approval Cascade');
  const [executionMode, setExecutionMode] = useState<WorkflowBuilderExecutionMode>('SEQUENTIAL');
  const [eventKey, setEventKey] = useState<WorkflowBuilderEventKey | null>(null);
  const [slots, setSlots] = useState<WorkflowActionSlot[]>(actionSlotsTemplate);

  const foundationQuery = useQuery({
    queryKey: ['workflow-builder-foundation'],
    queryFn: () => automationApi.getWorkflowBuilder(),
    staleTime: 60_000,
  });

  const previewMutation = useMutation({
    mutationFn: async () => {
      if (!eventKey) {
        throw new Error('Please drop a trigger event first.');
      }

      return automationApi.previewWorkflowBuilder({
        workflowName,
        eventKey,
        executionMode,
        steps: slots
          .filter((slot) => slot.stepType && slot.stepLabel)
          .map((slot) => ({
            id: slot.id,
            type: slot.stepType!,
            label: slot.stepLabel!,
          })),
      });
    },
  });

  const preview = previewMutation.data?.data;
  const filledSlotCount = slots.filter((slot) => slot.stepType).length;

  const handleTriggerDrop = (payload: string) => {
    const parsed = parseWorkflowPayload(payload);

    if (!parsed || parsed.kind !== 'event') {
      return;
    }

    setEventKey(parsed.eventKey);
  };

  const handleStepDrop = (slotId: string, payload: string) => {
    const parsed = parseWorkflowPayload(payload);

    if (!parsed || parsed.kind !== 'step') {
      return;
    }

    setSlots((current) =>
      current.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              stepType: parsed.stepType,
              stepLabel: parsed.label,
            }
          : slot,
      ),
    );
  };

  const loadStarterTemplate = () => {
    const template = foundationQuery.data?.data.starterTemplate;

    if (!template) {
      return;
    }

    setEventKey(template.eventKey);
    setSlots((current) =>
      current.map((slot, index) => ({
        ...slot,
        stepType: template.steps[index]?.type ?? null,
        stepLabel: template.steps[index]?.label ?? null,
      })),
    );
  };

  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-lime-700 dark:text-lime-300">
              Sprint 12B / Workflow Builder
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Builder orchestration ala n8n untuk event, email, WhatsApp, Slack, invoice, PDF,
              Drive, dan notify manager
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Drag + Drop Flow</StatusBadge>
            <StatusBadge tone="success">Automation Preview</StatusBadge>
            <StatusBadge tone="success">Multi-Channel</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Workbench ini membawa NovaERP lebih dekat ke workflow builder visual. User bisa
          menjatuhkan trigger dan action ke lane orkestrasi, lalu API menyiapkan preview eksekusi,
          artefak yang terbentuk, notifikasi lintas channel, dan risk check sebelum flow dipublish.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Flow Setup</p>
              <h3 className="text-xl font-semibold">Workflow identity and execution mode</h3>
            </div>
            <StatusBadge tone="neutral">{filledSlotCount} actions</StatusBadge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="font-medium">Workflow name</span>
              <input
                value={workflowName}
                onChange={(event) => setWorkflowName(event.target.value)}
                className="rounded-2xl border bg-transparent px-4 py-3"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Execution mode</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={executionMode}
                onChange={(event) =>
                  setExecutionMode(event.target.value as WorkflowBuilderExecutionMode)
                }
              >
                {(foundationQuery.data?.data.executionModes ?? ['SEQUENTIAL']).map((mode) => (
                  <option key={mode} value={mode}>
                    {titleCase(mode)}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950/70">
              Trigger event:
              <div className="mt-2 font-semibold">
                {eventKey ? titleCase(eventKey) : 'Drop trigger event here first'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={loadStarterTemplate}
            className="rounded-2xl border px-4 py-3 text-sm font-semibold"
          >
            Load purchase-order starter flow
          </button>
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Triggers</p>
                  <h3 className="text-lg font-semibold">Start events</h3>
                </div>
                <StatusBadge tone="neutral">
                  {foundationQuery.data?.data.eventKeys.length ?? 0}
                </StatusBadge>
              </div>

              {(foundationQuery.data?.data.eventKeys ?? []).map((key) => (
                <button
                  key={key}
                  type="button"
                  draggable
                  onDragStart={(event) =>
                    event.dataTransfer.setData(
                      'text/plain',
                      JSON.stringify({ kind: 'event', eventKey: key }),
                    )
                  }
                  className="w-full rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-left text-sm font-semibold transition hover:border-lime-300 hover:bg-lime-50/70 dark:border-slate-800 dark:bg-slate-950/70 dark:hover:border-lime-900"
                >
                  {titleCase(key)}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Actions</p>
                  <h3 className="text-lg font-semibold">Operational steps</h3>
                </div>
                <StatusBadge tone="neutral">
                  {foundationQuery.data?.data.stepTypes.length ?? 0}
                </StatusBadge>
              </div>

              {(foundationQuery.data?.data.stepTypes ?? []).map((type) => (
                <button
                  key={type}
                  type="button"
                  draggable
                  onDragStart={(event) =>
                    event.dataTransfer.setData(
                      'text/plain',
                      JSON.stringify({
                        kind: 'step',
                        stepType: type,
                        label: titleCase(type),
                      }),
                    )
                  }
                  className="w-full rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-left text-sm font-semibold transition hover:border-lime-300 hover:bg-lime-50/70 dark:border-slate-800 dark:bg-slate-950/70 dark:hover:border-lime-900"
                >
                  {titleCase(type)}
                </button>
              ))}
            </div>
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted">Flow Canvas</p>
            <h3 className="text-xl font-semibold">Drop one trigger and chain the actions below</h3>
          </div>
          <button
            type="button"
            onClick={() => previewMutation.mutate()}
            disabled={!eventKey || filledSlotCount === 0 || previewMutation.isPending}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
          >
            {previewMutation.isPending ? 'Preparing workflow preview...' : 'Preview workflow'}
          </button>
        </div>

        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleTriggerDrop(event.dataTransfer.getData('text/plain'));
          }}
          className="rounded-3xl border border-dashed border-lime-300/80 bg-lime-50/70 p-5 dark:border-lime-900 dark:bg-slate-950/50"
        >
          <p className="text-sm uppercase tracking-[0.16em] text-muted">Trigger Slot</p>
          <p className="mt-2 text-lg font-semibold">
            {eventKey ? titleCase(eventKey) : 'Drop workflow event here'}
          </p>
        </div>

        <div className="grid gap-3">
          {slots.map((slot, index) => (
            <div key={slot.id} className="grid gap-3 md:grid-cols-[56px_1fr]">
              <div className="flex items-center justify-center text-sm font-semibold text-muted">
                {index + 1}
              </div>
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  handleStepDrop(slot.id, event.dataTransfer.getData('text/plain'));
                }}
                className="rounded-3xl border border-dashed border-slate-300/80 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{slot.label}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">{slot.id}</p>
                  </div>
                  {slot.stepType ? (
                    <button
                      type="button"
                      onClick={() =>
                        setSlots((current) =>
                          current.map((currentSlot) =>
                            currentSlot.id === slot.id
                              ? { ...currentSlot, stepType: null, stepLabel: null }
                              : currentSlot,
                          ),
                        )
                      }
                      className="text-xs font-medium text-rose-600"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-4 text-sm dark:border-slate-800 dark:bg-slate-950/90">
                  {slot.stepType ? (
                    <>
                      <p className="font-semibold">{slot.stepLabel}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                        {titleCase(slot.stepType)}
                      </p>
                    </>
                  ) : (
                    <p className="text-muted">Drop action here</p>
                  )}
                </div>
              </div>
            </div>
          ))}
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
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">
                    Execution Preview
                  </p>
                  <h3 className="text-xl font-semibold">{preview.workflowName}</h3>
                </div>
                <StatusBadge tone={statusToneMap[preview.status]}>
                  {titleCase(preview.status)}
                </StatusBadge>
              </div>

              <p className="text-sm leading-7 text-muted">{preview.summary}</p>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  ['Mode', titleCase(preview.executionMode)],
                  ['Steps', String(preview.stepCount)],
                  ['Duration', `${preview.estimatedDurationSeconds}s`],
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

              <div className="rounded-2xl border border-lime-200/80 bg-lime-50/80 px-4 py-3 text-sm dark:border-lime-900/60 dark:bg-lime-950/30">
                Next simulation: <span className="font-semibold">{preview.nextSimulationAt}</span>
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Outputs</p>
                <h3 className="text-xl font-semibold">Artifacts and notifications</h3>
              </div>

              <div className="grid gap-3">
                {preview.generatedArtifacts.map((artifact) => (
                  <div
                    key={artifact}
                    className="rounded-2xl border border-slate-200/80 px-4 py-3 text-sm dark:border-slate-800"
                  >
                    {artifact}
                  </div>
                ))}
              </div>

              <div className="grid gap-3">
                {preview.notifications.map((notification) => (
                  <div
                    key={notification}
                    className="rounded-2xl border border-sky-200/80 bg-sky-50/70 px-4 py-3 text-sm dark:border-sky-900/60 dark:bg-sky-950/30"
                  >
                    {notification}
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <SurfaceCard className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Step Narrative</p>
                <h3 className="text-xl font-semibold">How each dropped action behaves</h3>
              </div>

              <div className="grid gap-3">
                {preview.steps.map((step) => (
                  <div
                    key={`${step.order}-${step.label}`}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold">
                        {step.order}. {step.label}
                      </p>
                      <StatusBadge tone="neutral">{step.channel}</StatusBadge>
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted">
                      {titleCase(step.type)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">{step.expectedOutcome}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Risk Checks</p>
                <h3 className="text-xl font-semibold">What should stay governed before publish</h3>
              </div>

              <div className="grid gap-3">
                {preview.riskChecks.map((risk) => (
                  <div
                    key={risk}
                    className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm dark:border-amber-900/60 dark:bg-amber-950/30"
                  >
                    {risk}
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
