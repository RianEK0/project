import { AiPlaceholderPage } from '@/features/ai/ai-placeholder-page';

export default function AiProcurementPage() {
  return (
    <AiPlaceholderPage
      eyebrow="AI / Procurement"
      title="Summarize sourcing risk, RFQ priorities, and vendor performance signals"
      description="AI Procurement foundation membaca purchase request, RFQ, quotation, vendor comparison, lead time, dan analytics signal untuk membantu buyer memprioritaskan tindakan yang paling relevan."
      highlights={[
        'RFQ and quotation recap',
        'Vendor lead-time signal',
        'Backorder mitigation prompts',
        'Procurement action ranking',
      ]}
      relatedLinks={[
        { href: '/app/procurement', label: 'Procurement' },
        { href: '/app/ai/recommendations', label: 'AI recommendation' },
        { href: '/app/ai/forecast', label: 'AI forecast' },
      ]}
    />
  );
}
