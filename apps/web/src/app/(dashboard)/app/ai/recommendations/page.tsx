import { AiPlaceholderPage } from '@/features/ai/ai-placeholder-page';

export default function AiRecommendationsPage() {
  return (
    <AiPlaceholderPage
      eyebrow="AI / Recommendation"
      title="Score actions by impact, urgency, and confidence before escalation"
      description="AI Recommendation foundation memberi ranking starter untuk tindakan lintas domain sehingga user bisa melihat mana yang paling layak diangkat terlebih dahulu dari procurement, sales, accounting, HR, atau manufacturing."
      highlights={[
        'Weighted scoring preview',
        'Priority buckets from low to critical',
        'Action sequencing starter',
        'Cross-domain escalation support',
      ]}
      relatedLinks={[
        { href: '/app/ai/procurement', label: 'AI procurement' },
        { href: '/app/ai/sales', label: 'AI sales' },
        { href: '/app/ai/accounting', label: 'AI accounting' },
      ]}
    />
  );
}
