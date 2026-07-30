import { FinancePlaceholderPage } from '@/features/finance/finance-placeholder-page';

export default function VouchersPage() {
  return (
    <FinancePlaceholderPage
      eyebrow="Finance / Voucher"
      title="Coordinate payment, receipt, adjustment, and accrual documents"
      description="Voucher foundation menyiapkan dokumen kontrol finance untuk kas, bank, accrual, adjustment, dan receipt sebelum data tersebut mengalir ke journal dan posting."
      highlights={[
        'Payment and receipt voucher starter',
        'Adjustment and accrual control',
        'Approval before posting',
        'Bank and cash linkage',
      ]}
      relatedLinks={[
        { href: '/app/finance/banks', label: 'Banks' },
        { href: '/app/finance/cash', label: 'Cash' },
        { href: '/app/finance/journals', label: 'Journals' },
      ]}
    />
  );
}
