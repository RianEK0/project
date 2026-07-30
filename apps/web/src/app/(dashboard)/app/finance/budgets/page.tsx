import { FinancePlaceholderPage } from '@/features/finance/finance-placeholder-page';

export default function BudgetsPage() {
  return (
    <FinancePlaceholderPage
      eyebrow="Finance / Budget"
      title="Plan budget dimensions, approval, locking, and variance baseline"
      description="Budget foundation menyiapkan struktur rencana anggaran berdasarkan account, cost center, period, dan project agar finance dapat membaca variance secara konsisten."
      highlights={[
        'Budget version lifecycle',
        'Approval and locking control',
        'Account and cost center planning',
        'Variance baseline for future reporting',
      ]}
      relatedLinks={[
        { href: '/app/finance/cost-centers', label: 'Cost centers' },
        { href: '/app/finance/fiscal-years', label: 'Fiscal years' },
        { href: '/app/finance/profit-loss', label: 'Profit loss' },
      ]}
    />
  );
}
