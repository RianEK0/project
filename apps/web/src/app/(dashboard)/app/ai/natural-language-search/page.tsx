import { AiPlaceholderPage } from '@/features/ai/ai-placeholder-page';

export default function NaturalLanguageSearchPage() {
  return (
    <AiPlaceholderPage
      eyebrow="AI / Natural Language Search"
      title="Translate plain-English requests into domain-aware search plans"
      description="Natural Language Search foundation memetakan pertanyaan bebas menjadi domain, filter, dan execution plan agar pencarian ERP dapat dimulai dari bahasa bisnis, bukan dari query builder atau menu nested."
      highlights={[
        'Query normalization',
        'Primary and related domain planning',
        'Filter extraction starter',
        'Route suggestion for search results',
      ]}
      relatedLinks={[
        { href: '/app/ai/chat-erp', label: 'Chat ERP' },
        { href: '/app/analytics', label: 'Analytics' },
        { href: '/app/ai/analytics', label: 'AI analytics' },
      ]}
    />
  );
}
