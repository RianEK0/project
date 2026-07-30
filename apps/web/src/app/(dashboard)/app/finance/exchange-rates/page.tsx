import { FinancePlaceholderPage } from '@/features/finance/finance-placeholder-page';

export default function ExchangeRatesPage() {
  return (
    <FinancePlaceholderPage
      eyebrow="Finance / Exchange Rate"
      title="Capture spot, budget, corporate, and month-end rate foundations"
      description="Exchange rate workspace menyiapkan rate type, rate source, dan readiness untuk kebutuhan revaluation, budgeting, treasury, dan reporting multi-currency."
      highlights={[
        'Spot and month-end rates',
        'Corporate and budget rate variants',
        'Manual and treasury source starter',
        'Multi-currency statement dependency',
      ]}
      relatedLinks={[
        { href: '/app/finance/currencies', label: 'Currencies' },
        { href: '/app/finance/general-ledger', label: 'General ledger' },
        { href: '/app/finance/financial-statements', label: 'Financial statements' },
      ]}
    />
  );
}
