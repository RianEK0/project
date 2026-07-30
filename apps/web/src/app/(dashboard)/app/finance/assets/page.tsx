import { FinancePlaceholderPage } from '@/features/finance/finance-placeholder-page';

export default function AssetsPage() {
  return (
    <FinancePlaceholderPage
      eyebrow="Finance / Asset"
      title="Maintain fixed asset register, lifecycle, and reporting context"
      description="Fixed asset foundation memisahkan asset register finance dari stok operasional biasa, sehingga aset dapat dihubungkan ke depreciation, disposal, dan statement reporting."
      highlights={[
        'Fixed asset category and status',
        'In-service and disposal lifecycle',
        'Cost center ownership starter',
        'Depreciation linkage',
      ]}
      relatedLinks={[
        { href: '/app/finance/depreciation', label: 'Depreciation' },
        { href: '/app/finance/cost-centers', label: 'Cost centers' },
        { href: '/app/finance/balance-sheet', label: 'Balance sheet' },
      ]}
    />
  );
}
