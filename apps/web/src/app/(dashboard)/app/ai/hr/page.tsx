import { AiPlaceholderPage } from '@/features/ai/ai-placeholder-page';

export default function AiHrPage() {
  return (
    <AiPlaceholderPage
      eyebrow="AI / HR"
      title="Summarize attendance, payroll, recruitment, and people operations exceptions"
      description="AI HR foundation menyiapkan ringkasan untuk attendance, leave, payroll, recruitment, performance, training, dan KPI supaya people operations bisa fokus ke exception yang benar-benar perlu tindak lanjut."
      highlights={[
        'Attendance anomaly recap',
        'Payroll and leave signal review',
        'Recruitment backlog prompts',
        'People-risk prioritization',
      ]}
      relatedLinks={[
        { href: '/app/hr', label: 'HR' },
        { href: '/app/ai/forecast', label: 'AI forecast' },
        { href: '/app/ai/recommendations', label: 'AI recommendation' },
      ]}
    />
  );
}
