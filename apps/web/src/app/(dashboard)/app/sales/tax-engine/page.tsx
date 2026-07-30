import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

export default function TaxEnginePage() {
  return (
    <SalesPlaceholderPage
      eyebrow="Tax Engine"
      title="Preview tax outcomes before invoice issue"
      description="Tax engine starter menghitung mode exclusive, inclusive, zero rated, dan exempt untuk kebutuhan komersial."
      highlights={['Tax modes', 'Net amount', 'Tax amount', 'Gross amount']}
      relatedLinks={[
        { href: '/app/sales/invoices', label: 'Sales invoices' },
        { href: '/app/sales/orders', label: 'Sales orders' },
      ]}
    />
  );
}
