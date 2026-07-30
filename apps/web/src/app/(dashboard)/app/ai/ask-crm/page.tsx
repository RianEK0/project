import { AiPlaceholderPage } from '@/features/ai/ai-placeholder-page';

export default function AskCrmPage() {
  return (
    <AiPlaceholderPage
      eyebrow="AI / Ask CRM"
      title="Inspect pipeline, follow-up, and deal movement with CRM-aware prompts"
      description="Ask CRM foundation membantu membaca lead, opportunity, deal, activity, dan follow-up signal agar sales manager bisa bertanya langsung tentang bottleneck pipeline atau akun yang melambat."
      highlights={[
        'Lead and opportunity question lane',
        'Overdue follow-up recap',
        'Deal risk summarization',
        'Next-best action support',
      ]}
      relatedLinks={[
        { href: '/app/crm', label: 'CRM' },
        { href: '/app/sales', label: 'Sales' },
        { href: '/app/ai/recommendations', label: 'AI recommendation' },
      ]}
    />
  );
}
