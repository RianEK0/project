import { FinancePlaceholderPage } from '@/features/finance/finance-placeholder-page';

export default function FiscalYearsPage() {
  return (
    <FinancePlaceholderPage
      eyebrow="Finance / Fiscal Year"
      title="Open, soft-close, and close reporting periods with checklist control"
      description="Fiscal year foundation menjadi tempat untuk mengelola period status, open-close checklist, dan kesiapan statement sebelum penutupan akhir."
      highlights={[
        'Draft, open, soft-close, and close states',
        'Checklist for period close',
        'Budget and ledger period alignment',
        'Statement release readiness',
      ]}
      relatedLinks={[
        { href: '/app/finance/general-ledger', label: 'General ledger' },
        { href: '/app/finance/budgets', label: 'Budgets' },
        { href: '/app/finance/financial-statements', label: 'Financial statements' },
      ]}
    />
  );
}
