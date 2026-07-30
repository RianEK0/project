import { FinancePlaceholderPage } from '@/features/finance/finance-placeholder-page';

export default function ProfitLossPage() {
  return (
    <FinancePlaceholderPage
      eyebrow="Finance / Profit Loss"
      title="Organize revenue and expense sections for period performance review"
      description="Profit loss starter merangkum pendapatan, cost of sales, dan operating expense agar tim finance serta manajemen mendapat pandangan periodik yang lebih tertata."
      highlights={[
        'Revenue and expense section mapping',
        'Operating performance baseline',
        'Budget variance direction',
        'Depreciation expense linkage',
      ]}
      relatedLinks={[
        { href: '/app/finance/budgets', label: 'Budgets' },
        { href: '/app/finance/depreciation', label: 'Depreciation' },
        { href: '/app/finance/financial-statements', label: 'Financial statements' },
      ]}
    />
  );
}
