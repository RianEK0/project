import { AiPlaceholderPage } from '@/features/ai/ai-placeholder-page';

export default function ChatErpPage() {
  return (
    <AiPlaceholderPage
      eyebrow="AI / Chat ERP"
      title="Route cross-domain ERP questions into the right operational context"
      description="Chat ERP foundation menyiapkan orkestrasi prompt lintas inventory, finance, CRM, procurement, sales, HR, manufacturing, dan analytics agar user bisa mulai dari pertanyaan bisnis, bukan dari menu teknis."
      highlights={[
        'Prompt routing by domain intent',
        'Insight type classification',
        'Next-step preview for operators',
        'Cross-domain copilot handoff',
      ]}
      relatedLinks={[
        { href: '/app/ai/natural-language-search', label: 'Natural language search' },
        { href: '/app/ai/recommendations', label: 'AI recommendation' },
        { href: '/app/ai/analytics', label: 'AI analytics' },
      ]}
    />
  );
}
