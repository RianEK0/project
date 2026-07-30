import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

export default function NewSalesQuotationPage() {
  return (
    <CrmPlaceholderPage
      eyebrow="New Quotation"
      title="Draft a commercial proposal"
      description="Halaman ini akan menjadi tempat memilih customer, opportunity, item, harga, diskon, dan masa berlaku quotation."
      highlights={['Commercial terms', 'Item pricing', 'Expiry date', 'Approval notes']}
      relatedLinks={[
        { href: '/app/crm/quotations', label: 'Back to quotations' },
        { href: '/app/crm/opportunities', label: 'Linked opportunities' },
      ]}
    />
  );
}
