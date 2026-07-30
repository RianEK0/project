import { FinancePlaceholderPage } from '@/features/finance/finance-placeholder-page';

export default function CashFlowPage() {
  return (
    <FinancePlaceholderPage
      eyebrow="Finance / Cash Flow"
      title="Separate operating, investing, and financing movement views"
      description="Cash flow starter memisahkan arus kas operating, investing, dan financing agar treasury, payment, asset, dan funding movement dapat dibaca dari sudut yang lebih strategis."
      highlights={[
        'Operating, investing, and financing split',
        'Bank and cash account dependency',
        'Asset acquisition visibility',
        'Treasury-ready reporting direction',
      ]}
      relatedLinks={[
        { href: '/app/finance/banks', label: 'Banks' },
        { href: '/app/finance/cash', label: 'Cash' },
        { href: '/app/finance/assets', label: 'Assets' },
      ]}
    />
  );
}
