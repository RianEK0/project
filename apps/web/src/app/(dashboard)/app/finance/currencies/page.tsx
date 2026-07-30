import { FinancePlaceholderPage } from '@/features/finance/finance-placeholder-page';

export default function CurrenciesPage() {
  return (
    <FinancePlaceholderPage
      eyebrow="Finance / Currency"
      title="Maintain base and foreign currency availability for finance reporting"
      description="Currency foundation menyiapkan base currency, supported currency, dan status aktif/nonaktif untuk kebutuhan treasury, invoice, dan statement lintas mata uang."
      highlights={[
        'Base currency control',
        'Supported code catalog',
        'Active/inactive currency lifecycle',
        'Exchange-rate dependency',
      ]}
      relatedLinks={[
        { href: '/app/finance/exchange-rates', label: 'Exchange rates' },
        { href: '/app/finance/general-ledger', label: 'General ledger' },
        { href: '/app/finance/cash-flow', label: 'Cash flow' },
      ]}
    />
  );
}
