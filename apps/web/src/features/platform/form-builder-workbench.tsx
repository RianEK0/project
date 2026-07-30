'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';
import {
  type FormBuilderArtifactType,
  type FormBuilderFieldType,
  type FormBuilderLayoutMode,
} from '@nova/shared-types';

import { platformApi } from '@/services/api/platform';

type FormPaletteItem = {
  id: string;
  label: string;
  type: FormBuilderFieldType;
};

type FormCanvasField = {
  id: string;
  label: string;
  type: FormBuilderFieldType;
  required: boolean;
  section: string;
};

const statusToneMap = {
  DRAFT: 'neutral',
  READY: 'success',
  REVIEW_NEEDED: 'warning',
} as const;

const canvasSections = ['General', 'Review', 'Evidence'] as const;

function titleCase(value: string) {
  return value
    .replaceAll('_', ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function parsePaletteItem(payload: string): FormPaletteItem | null {
  try {
    const parsed = JSON.parse(payload) as FormPaletteItem;

    if (!parsed.id || !parsed.label || !parsed.type) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function FormBuilderWorkbench() {
  const [name, setName] = useState('Warehouse Dock Inspection');
  const [artifactType, setArtifactType] = useState<FormBuilderArtifactType>('INSPECTION');
  const [layoutMode, setLayoutMode] = useState<FormBuilderLayoutMode>('TWO_COLUMN');
  const [fields, setFields] = useState<FormCanvasField[]>([]);

  const foundationQuery = useQuery({
    queryKey: ['form-builder-foundation'],
    queryFn: () => platformApi.getFormBuilder(),
    staleTime: 60_000,
  });

  const previewMutation = useMutation({
    mutationFn: async () =>
      platformApi.previewFormBuilder({
        name,
        artifactType,
        layoutMode,
        fields: fields.map((field) => ({
          id: field.id,
          label: field.label,
          type: field.type,
          required: field.required,
          section: field.section,
        })),
      }),
  });

  const preview = previewMutation.data?.data;

  const paletteItems =
    foundationQuery.data?.data.starterFields.map((field) => ({
      id: `${field.label}-${field.type}`.toLowerCase().replaceAll(' ', '-'),
      label: field.label,
      type: field.type,
    })) ?? [];

  const handleDrop = (section: string, payload: string) => {
    const item = parsePaletteItem(payload);

    if (!item) {
      return;
    }

    setFields((current) => [
      ...current,
      {
        id: `${section}-${item.id}-${current.length + 1}`,
        label: item.label,
        type: item.type,
        required: !['CHECKBOX', 'PHOTO'].includes(item.type),
        section,
      },
    ]);
  };

  const loadSuggestedForm = () => {
    setFields([
      {
        id: 'general-requester',
        label: 'Requester name',
        type: 'SHORT_TEXT',
        required: true,
        section: 'General',
      },
      {
        id: 'general-date',
        label: 'Inspection date',
        type: 'DATE',
        required: true,
        section: 'General',
      },
      {
        id: 'review-approval',
        label: 'Approval decision',
        type: 'APPROVAL_STATUS',
        required: true,
        section: 'Review',
      },
      {
        id: 'evidence-photo',
        label: 'Inspection photo',
        type: 'PHOTO',
        required: false,
        section: 'Evidence',
      },
    ]);
  };

  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-700 dark:text-slate-300">
              Sprint 12C / Form Builder
            </p>
            <h2 className="font-display text-3xl font-semibold">
              No-code builder untuk form, survey, approval, checklist, inspection, dan custom module
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">No Code</StatusBadge>
            <StatusBadge tone="success">Drag + Drop Fields</StatusBadge>
            <StatusBadge tone="success">Platform Experience</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Workbench ini menyiapkan no-code schema builder untuk form operasional. User cukup memilih
          tipe artefak, menyeret field ke section yang tepat, lalu NovaERP mengembalikan preview
          module, target publish, binding data, dan routing approval bila dibutuhkan.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Form Setup</p>
              <h3 className="text-xl font-semibold">Artifact type and layout</h3>
            </div>
            <StatusBadge tone="neutral">{fields.length} fields</StatusBadge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="font-medium">Builder name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="rounded-2xl border bg-transparent px-4 py-3"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Artifact type</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={artifactType}
                onChange={(event) => setArtifactType(event.target.value as FormBuilderArtifactType)}
              >
                {(foundationQuery.data?.data.artifactTypes ?? ['FORM']).map((type) => (
                  <option key={type} value={type}>
                    {titleCase(type)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Layout mode</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={layoutMode}
                onChange={(event) => setLayoutMode(event.target.value as FormBuilderLayoutMode)}
              >
                {(foundationQuery.data?.data.layoutModes ?? ['SINGLE_COLUMN']).map((mode) => (
                  <option key={mode} value={mode}>
                    {titleCase(mode)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {(foundationQuery.data?.data.publishingTargets ?? []).map((target) => (
              <StatusBadge key={target} tone="neutral">
                {target}
              </StatusBadge>
            ))}
          </div>

          <button
            type="button"
            onClick={loadSuggestedForm}
            className="rounded-2xl border px-4 py-3 text-sm font-semibold"
          >
            Load inspection starter
          </button>
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Field Palette</p>
              <h3 className="text-xl font-semibold">Drag starter fields into sections</h3>
            </div>
            <StatusBadge tone="neutral">{paletteItems.length} starter fields</StatusBadge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {paletteItems.map((item) => (
              <button
                key={item.id}
                type="button"
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData('text/plain', JSON.stringify(item))
                }
                className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-left transition hover:border-slate-400 hover:bg-slate-100/70 dark:border-slate-800 dark:bg-slate-950/70 dark:hover:border-slate-700"
              >
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                  {titleCase(item.type)}
                </p>
              </button>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted">Canvas</p>
            <h3 className="text-xl font-semibold">Drop fields into sections</h3>
          </div>
          <button
            type="button"
            onClick={() => previewMutation.mutate()}
            disabled={fields.length === 0 || previewMutation.isPending}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
          >
            {previewMutation.isPending ? 'Preparing form preview...' : 'Preview form module'}
          </button>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {canvasSections.map((section) => {
            const sectionFields = fields.filter((field) => field.section === section);

            return (
              <div
                key={section}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  handleDrop(section, event.dataTransfer.getData('text/plain'));
                }}
                className="min-h-[220px] rounded-3xl border border-dashed border-slate-300/80 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{section}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">
                      {sectionFields.length} fields
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  {sectionFields.length > 0 ? (
                    sectionFields.map((field) => (
                      <div
                        key={field.id}
                        className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/90"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{field.label}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                              {titleCase(field.type)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setFields((current) => current.filter((item) => item.id !== field.id))
                            }
                            className="text-xs font-medium text-rose-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-6 text-sm text-muted dark:border-slate-800 dark:bg-slate-950/90">
                      Drop fields here
                    </p>
                  )}
                </div>
              </div>
            );
          })}
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
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Module Preview</p>
                  <h3 className="text-xl font-semibold">{preview.name}</h3>
                </div>
                <StatusBadge tone={statusToneMap[preview.status]}>
                  {titleCase(preview.status)}
                </StatusBadge>
              </div>

              <p className="text-sm leading-7 text-muted">{preview.summary}</p>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  ['Artifact', titleCase(preview.artifactType)],
                  ['Fields', String(preview.fieldCount)],
                  ['Completion', `${preview.estimatedCompletionMinutes} min`],
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
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Publishing</p>
                <h3 className="text-xl font-semibold">Module and routing posture</h3>
              </div>

              <div className="rounded-2xl border border-slate-200/80 px-4 py-3 text-sm dark:border-slate-800">
                Generated module: <span className="font-semibold">{preview.generatedModule}</span>
              </div>

              <div className="rounded-2xl border border-slate-200/80 px-4 py-3 text-sm dark:border-slate-800">
                Approval routing:{' '}
                <span className="font-semibold">
                  {preview.approvalRouting ? 'Enabled' : 'Not required'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {preview.publicationTargets.map((target) => (
                  <StatusBadge key={target} tone="success">
                    {target}
                  </StatusBadge>
                ))}
              </div>
            </SurfaceCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <SurfaceCard className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Sections</p>
                <h3 className="text-xl font-semibold">How the no-code form is grouped</h3>
              </div>

              <div className="grid gap-3">
                {preview.sections.map((section) => (
                  <div
                    key={section.title}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{section.title}</p>
                      <StatusBadge tone="neutral">{section.fieldCount} fields</StatusBadge>
                    </div>
                    <p className="mt-2 text-sm text-muted">{section.fieldLabels.join(', ')}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Bindings</p>
                <h3 className="text-xl font-semibold">Downstream objects created by the builder</h3>
              </div>

              <div className="grid gap-3">
                {preview.dataBindings.map((binding) => (
                  <div
                    key={binding}
                    className="rounded-2xl border border-sky-200/80 bg-sky-50/70 px-4 py-3 text-sm dark:border-sky-900/60 dark:bg-sky-950/30"
                  >
                    {binding}
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
