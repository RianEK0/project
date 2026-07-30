import { FinancePlaceholderPage } from '@/features/finance/finance-placeholder-page';

export default function BanksPage() {
  return (
    <FinancePlaceholderPage
      eyebrow="Finance / Bank"
      title="Maintain treasury bank accounts and reconciliation readiness"
      description="Bank account foundation mengelola rekening operasional, payroll, clearing, dan virtual account context sebelum statement import dan reconciliation automation yang lebih dalam."
      highlights={[
        'Bank account master data',
        'Operational and clearing account types',
        'Reconciliation readiness',
        'Treasury visibility',
      ]}
      relatedLinks={[
        { href: '/app/finance/cash', label: 'Cash' },
        { href: '/app/finance/vouchers', label: 'Vouchers' },
        { href: '/app/finance/exchange-rates', label: 'Exchange rates' },
      ]}
    />
  );
}
