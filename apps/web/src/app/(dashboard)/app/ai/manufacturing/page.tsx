import { AiPlaceholderPage } from '@/features/ai/ai-placeholder-page';

export default function AiManufacturingPage() {
  return (
    <AiPlaceholderPage
      eyebrow="AI / Manufacturing"
      title="Digest MRP shortages, bottlenecks, quality loss, and planning load"
      description="AI Manufacturing foundation memberi ringkasan untuk BOM, production, work order, machine, maintenance, quality, MRP, dan capacity planning agar planner dan supervisor cepat membaca risiko shop-floor."
      highlights={[
        'MRP shortage briefing',
        'Capacity overload prompts',
        'Quality and scrap recap',
        'Planner escalation support',
      ]}
      relatedLinks={[
        { href: '/app/manufacturing', label: 'Manufacturing' },
        { href: '/app/ai/forecast', label: 'AI forecast' },
        { href: '/app/ai/reports', label: 'AI report' },
      ]}
    />
  );
}
