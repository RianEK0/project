import { FinancePlaceholderPage } from '@/features/finance/finance-placeholder-page';

export default function BalanceSheetPage() {
  return (
    <FinancePlaceholderPage
      eyebrow="Finance / Balance Sheet"
      title="Read assets, liabilities, and equity structure from finance foundation"
      description="Balance sheet starter memetakan account grouping dan reporting section agar posisi keuangan organisasi dapat dibaca lebih cepat dari ledger dan chart of accounts."
      highlights={[
        'Asset section mapping',
        'Liability and equity grouping',
        'Fiscal period visibility',
        'Multi-currency reporting direction',
      ]}
      relatedLinks={[
        { href: '/app/finance/chart-of-accounts', label: 'Chart of account' },
        { href: '/app/finance/general-ledger', label: 'General ledger' },
        { href: '/app/finance/financial-statements', label: 'Financial statements' },
      ]}
    />
  );
}
