'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';
import { type AiMeetingType } from '@nova/shared-types';

import { aiApi } from '@/services/api/ai';

const artifactToneMap = {
  READY_TO_SHARE: 'success',
  REVIEW_NEEDED: 'warning',
} as const;

export function MeetingSummaryWorkbench() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [meetingType, setMeetingType] = useState<AiMeetingType>('PROCUREMENT_REVIEW');

  const foundationQuery = useQuery({
    queryKey: ['ai-meeting-foundation'],
    queryFn: () => aiApi.getAiMeeting(),
    staleTime: 60_000,
  });

  const summaryMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) {
        throw new Error('Please choose an audio file first.');
      }

      return aiApi.summarizeAiMeeting(selectedFile, meetingType);
    },
  });

  const summary = summaryMutation.data?.data;

  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-700 dark:text-slate-300">
              Sprint 14C / AI Meeting
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Upload audio meeting lalu ubah menjadi summary, action item, decision, deadline, dan
              PIC
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Audio Upload</StatusBadge>
            <StatusBadge tone="success">Decision Capture</StatusBadge>
            <StatusBadge tone="success">Follow-up Routing</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          AI Meeting menyiapkan lane untuk audio procurement review, sales sync, operations standup,
          atau executive sync. Hasilnya diringkas menjadi keputusan, action item, deadline, dan PIC
          yang siap dihubungkan ke task, reminder, atau workflow lain.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Audio Upload</p>
              <h3 className="text-xl font-semibold">Choose a meeting type and upload audio</h3>
            </div>
            <StatusBadge tone="neutral">
              {foundationQuery.data?.data.meetingTypes.length ?? 4} meeting types
            </StatusBadge>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Meeting type</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={meetingType}
                onChange={(event) => setMeetingType(event.target.value as AiMeetingType)}
              >
                {(foundationQuery.data?.data.meetingTypes ?? ['PROCUREMENT_REVIEW']).map((type) => (
                  <option key={type} value={type}>
                    {type.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Audio file</span>
              <input
                type="file"
                accept="audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/wav"
                className="rounded-2xl border border-dashed px-4 py-6 text-sm"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
            </label>

            <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm leading-6 text-muted dark:border-slate-800 dark:bg-slate-950/70">
              {selectedFile ? (
                <>
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p>
                    {(selectedFile.size / 1024).toFixed(1)} KB •{' '}
                    {selectedFile.type || 'unknown type'}
                  </p>
                </>
              ) : (
                <p>
                  Belum ada audio dipilih. Gunakan rekaman meeting procurement, sales, operations,
                  atau executive sync.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => summaryMutation.mutate()}
              disabled={!selectedFile || summaryMutation.isPending}
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
            >
              {summaryMutation.isPending ? 'Summarizing meeting...' : 'Run AI Meeting summary'}
            </button>

            {summaryMutation.isError ? (
              <p className="text-sm text-rose-600">{summaryMutation.error.message}</p>
            ) : null}
          </div>
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Output Contract</p>
              <h3 className="text-xl font-semibold">
                Sections AI Meeting will always try to return
              </h3>
            </div>
            <StatusBadge tone="neutral">
              {foundationQuery.data?.data.outputSections.length ?? 5} sections
            </StatusBadge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {(foundationQuery.data?.data.outputSections ?? []).map((section) => (
              <div
                key={section}
                className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950/70"
              >
                {section}
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {(foundationQuery.data?.data.supportedLanguages ?? []).map((language) => (
              <div
                key={language}
                className="rounded-2xl border border-slate-200/80 px-4 py-3 text-sm font-medium dark:border-slate-800"
              >
                {language}
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      {summary ? (
        <>
          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Summary</p>
                  <h3 className="text-xl font-semibold">Meeting recap from the uploaded audio</h3>
                </div>
                <StatusBadge tone={artifactToneMap[summary.artifactStatus]}>
                  {summary.artifactStatus.replaceAll('_', ' ')}
                </StatusBadge>
              </div>

              <p className="text-sm leading-7 text-muted">{summary.summary}</p>

              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ['Meeting type', summary.meetingType.replaceAll('_', ' ')],
                  ['Language', summary.language],
                  ['Participants', `${summary.participants.length} people`],
                  ['Routes', `${summary.followUpRoutes.length} follow-ups`],
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
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Participants</p>
                  <h3 className="text-xl font-semibold">Who joined the discussion</h3>
                </div>
                <StatusBadge tone="neutral">{summary.participants.length} people</StatusBadge>
              </div>

              <div className="grid gap-3">
                {summary.participants.map((participant) => (
                  <div
                    key={`${participant.name}-${participant.role}`}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    <p className="text-sm font-semibold">{participant.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                      {participant.role}
                    </p>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Decisions</p>
                  <h3 className="text-xl font-semibold">Key decisions captured from the audio</h3>
                </div>
                <StatusBadge tone="neutral">{summary.decisions.length} decisions</StatusBadge>
              </div>

              <div className="grid gap-3">
                {summary.decisions.map((decision) => (
                  <div
                    key={decision.title}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    <p className="text-sm font-semibold">{decision.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{decision.rationale}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Action Items</p>
                  <h3 className="text-xl font-semibold">
                    Owners, deadlines, and follow-up commitments
                  </h3>
                </div>
                <StatusBadge tone="neutral">{summary.actionItems.length} actions</StatusBadge>
              </div>

              <div className="grid gap-3">
                {summary.actionItems.map((item) => (
                  <div
                    key={`${item.title}-${item.pic}`}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <StatusBadge tone="neutral">{item.status}</StatusBadge>
                    </div>
                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted">PIC</p>
                        <p className="text-sm font-medium">{item.pic}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted">Deadline</p>
                        <p className="text-sm font-medium">{item.deadline}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>

          <SurfaceCard className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Follow-up Routes</p>
                <h3 className="text-xl font-semibold">
                  Connected NovaERP routes for the next step
                </h3>
              </div>
              <StatusBadge tone="neutral">{summary.followUpRoutes.length} routes</StatusBadge>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {summary.followUpRoutes.map((route) => (
                <div
                  key={route}
                  className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm font-medium dark:border-slate-800 dark:bg-slate-950/70"
                >
                  {route}
                </div>
              ))}
            </div>
          </SurfaceCard>
        </>
      ) : null}
    </div>
  );
}
