import { AiPlaceholderPage } from '@/features/ai/ai-placeholder-page';

export default function AiForecastPage() {
  return (
    <AiPlaceholderPage
      eyebrow="AI / Forecast"
      title="Preview short-horizon projections for operational and financial signals"
      description="AI Forecast foundation menyediakan preview tren berbasis histori singkat untuk exposure procurement, backlog sales, cash signal, attendance risk, atau bottleneck produksi sebelum engine forecasting yang lebih berat ditambahkan."
      highlights={[
        '7-day to 12-month horizon presets',
        'Average-delta preview logic',
        'Trend and confidence signal',
        'Domain-ready forecast surfaces',
      ]}
      relatedLinks={[
        { href: '/app/ai/recommendations', label: 'AI recommendation' },
        { href: '/app/finance', label: 'Finance' },
        { href: '/app/manufacturing', label: 'Manufacturing' },
      ]}
    />
  );
}
