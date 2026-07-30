import { AiPlaceholderPage } from '@/features/ai/ai-placeholder-page';

export default function AiAnalyticsPage() {
  return (
    <AiPlaceholderPage
      eyebrow="AI / Analytics"
      title="Package cross-domain trends, anomalies, and escalation-worthy signals"
      description="AI Analytics foundation memposisikan AI sebagai lapisan ringkasan dan rekomendasi di atas analytics domain yang sudah ada, sehingga insight lintas finance, sales, procurement, HR, inventory, dan manufacturing bisa dipaketkan lebih cepat."
      highlights={[
        'Cross-domain exception digest',
        'Trend and anomaly packaging',
        'Executive-ready signal delivery',
        'Export and briefing starter',
      ]}
      relatedLinks={[
        { href: '/app/analytics', label: 'Analytics' },
        { href: '/app/ai/reports', label: 'AI report' },
        { href: '/app/ai/chat-erp', label: 'Chat ERP' },
      ]}
    />
  );
}
