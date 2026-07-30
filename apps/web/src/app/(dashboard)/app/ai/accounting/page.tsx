import { AiPlaceholderPage } from '@/features/ai/ai-placeholder-page';

export default function AiAccountingPage() {
  return (
    <AiPlaceholderPage
      eyebrow="AI / Accounting"
      title="Surface journal anomalies, close blockers, and cash-flow narratives"
      description="AI Accounting foundation difokuskan untuk general ledger, journal, posting, voucher, cash, bank, depreciation, dan financial statement signal agar tim akuntansi cepat melihat exception yang paling penting."
      highlights={[
        'Journal anomaly briefing',
        'Close-readiness review',
        'Cash-flow and statement recap',
        'Accounting blocker prioritization',
      ]}
      relatedLinks={[
        { href: '/app/finance', label: 'Finance' },
        { href: '/app/ai/analytics', label: 'AI analytics' },
        { href: '/app/ai/recommendations', label: 'AI recommendation' },
      ]}
    />
  );
}
