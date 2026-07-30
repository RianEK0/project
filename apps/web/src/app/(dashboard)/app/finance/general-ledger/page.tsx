import { FinancePlaceholderPage } from '@/features/finance/finance-placeholder-page';

export default function GeneralLedgerPage() {
  return (
    <FinancePlaceholderPage
      eyebrow="Finance / General Ledger"
      title="Review account movement, running balance, and reporting dimensions"
      description="General ledger foundation menyiapkan pembacaan mutasi akun per periode, cost center, dan currency agar journal yang sudah diposting dapat dikonsumsi oleh tim finance."
      highlights={[
        'Running balance visibility',
        'Fiscal period and currency dimension',
        'Cost center drill-through starter',
        'Statement-ready ledger view',
      ]}
      relatedLinks={[
        { href: '/app/finance/journals', label: 'Journals' },
        { href: '/app/finance/posting', label: 'Posting' },
        { href: '/app/finance/balance-sheet', label: 'Balance sheet' },
      ]}
    />
  );
}
