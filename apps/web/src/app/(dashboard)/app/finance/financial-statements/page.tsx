import { FinancePlaceholderPage } from '@/features/finance/finance-placeholder-page';

export default function FinancialStatementsPage() {
  return (
    <FinancePlaceholderPage
      eyebrow="Finance / Financial Statement"
      title="Compose statement catalog for ledger, trial balance, and core reports"
      description="Financial statement foundation menyusun katalog report finance dari ledger dan account structure agar balance sheet, profit loss, dan cash flow bisa dibaca dari satu workspace."
      highlights={[
        'Statement catalog starter',
        'Trial balance and ledger linkage',
        'Section-based report composition',
        'Export-ready reporting direction',
      ]}
      relatedLinks={[
        { href: '/app/finance/balance-sheet', label: 'Balance sheet' },
        { href: '/app/finance/profit-loss', label: 'Profit loss' },
        { href: '/app/finance/cash-flow', label: 'Cash flow' },
      ]}
    />
  );
}
