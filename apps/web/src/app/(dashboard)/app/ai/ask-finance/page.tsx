import { AiPlaceholderPage } from '@/features/ai/ai-placeholder-page';

export default function AskFinancePage() {
  return (
    <AiPlaceholderPage
      eyebrow="AI / Ask Finance"
      title="Read treasury, budget, and finance signals through a guided assistant"
      description="Ask Finance foundation menyediakan jalur tanya untuk cash position, bank, budget, exchange rate, dan finance exception sehingga supervisor tidak harus membuka banyak halaman sebelum memahami konteks."
      highlights={[
        'Cash and bank signal prompts',
        'Budget utilization recap',
        'Finance exception questioning',
        'Short-horizon forecast starter',
      ]}
      relatedLinks={[
        { href: '/app/finance', label: 'Finance' },
        { href: '/app/ai/forecast', label: 'AI forecast' },
        { href: '/app/ai/reports', label: 'AI report' },
      ]}
    />
  );
}
