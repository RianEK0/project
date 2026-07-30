import { FinancePlaceholderPage } from '@/features/finance/finance-placeholder-page';

export default function JournalsPage() {
  return (
    <FinancePlaceholderPage
      eyebrow="Finance / Journal"
      title="Prepare balanced journal entries before posting"
      description="Journal workspace menjadi area untuk menyusun baris debit-kredit, memastikan keseimbangan entry, dan mengontrol transisi sebelum posting atau reversal dilakukan."
      highlights={[
        'Balanced debit-credit validation',
        'Draft to posted transition',
        'Voucher-linked entry foundation',
        'Reversal-ready control point',
      ]}
      relatedLinks={[
        { href: '/app/finance/posting', label: 'Posting' },
        { href: '/app/finance/vouchers', label: 'Vouchers' },
        { href: '/app/finance/chart-of-accounts', label: 'Chart of account' },
      ]}
    />
  );
}
