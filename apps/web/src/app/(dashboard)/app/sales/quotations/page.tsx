import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

export default function SalesQuotationsPage() {
  return (
    <SalesPlaceholderPage
      eyebrow="Quotation"
      title="Reuse CRM quotations before order release"
      description="Area sales membaca quotation komersial yang sama dengan CRM, lalu memakainya sebagai sumber order dan invoice orchestration."
      highlights={['Shared lifecycle', 'Conversion path', 'Commercial terms', 'Expiry status']}
      relatedLinks={[
        { href: '/app/crm/quotations', label: 'CRM quotations' },
        { href: '/app/sales/orders', label: 'Sales orders' },
      ]}
    />
  );
}
