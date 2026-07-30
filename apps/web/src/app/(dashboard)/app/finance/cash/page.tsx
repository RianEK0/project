import { FinancePlaceholderPage } from '@/features/finance/finance-placeholder-page';

export default function CashPage() {
  return (
    <FinancePlaceholderPage
      eyebrow="Finance / Cash"
      title="Control petty cash, float, and cash-on-hand workflows"
      description="Cash workspace menyiapkan area kontrol untuk petty cash, cash drawer, dan float agar reimbursement, top-up, dan daily count dapat dimonitor lebih rapi."
      highlights={[
        'Petty cash and float model',
        'Daily count readiness',
        'Voucher-controlled cash movement',
        'Treasury exception starter',
      ]}
      relatedLinks={[
        { href: '/app/finance/vouchers', label: 'Vouchers' },
        { href: '/app/finance/banks', label: 'Banks' },
        { href: '/app/finance/cash-flow', label: 'Cash flow' },
      ]}
    />
  );
}
