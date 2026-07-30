import { AiPlaceholderPage } from '@/features/ai/ai-placeholder-page';

export default function AiReportsPage() {
  return (
    <AiPlaceholderPage
      eyebrow="AI / Report"
      title="Generate executive summaries, operation briefs, and exception digests"
      description="AI Report foundation menyiapkan report type, delivery mode, dan digest workflow agar manajemen bisa menerima ringkasan lintas domain tanpa menunggu reporting stack penuh."
      highlights={[
        'Executive summary starter',
        'Operational digest formats',
        'On-demand and scheduled delivery',
        'Cross-domain briefing handoff',
      ]}
      relatedLinks={[
        { href: '/app/ai/analytics', label: 'AI analytics' },
        { href: '/app/analytics', label: 'Analytics workspace' },
        { href: '/app/ai/forecast', label: 'AI forecast' },
      ]}
    />
  );
}
