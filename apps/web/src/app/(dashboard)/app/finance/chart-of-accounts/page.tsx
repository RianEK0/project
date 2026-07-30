import { FinancePlaceholderPage } from '@/features/finance/finance-placeholder-page';

export default function ChartOfAccountsPage() {
  return (
    <FinancePlaceholderPage
      eyebrow="Finance / Chart Of Account"
      title="Structure accounts, normal balance, and reporting-ready hierarchy"
      description="Chart of account menjadi fondasi finance untuk mengelompokkan akun aset, liabilitas, ekuitas, revenue, dan expense sebelum journal, voucher, posting, dan statement berjalan penuh."
      highlights={[
        'Account type and normal balance model',
        'Parent-child account hierarchy',
        'Archive and reporting readiness',
        'Cost center and statement mapping',
      ]}
      relatedLinks={[
        { href: '/app/finance/general-ledger', label: 'General ledger' },
        { href: '/app/finance/journals', label: 'Journals' },
        { href: '/app/finance/financial-statements', label: 'Financial statements' },
      ]}
    />
  );
}
