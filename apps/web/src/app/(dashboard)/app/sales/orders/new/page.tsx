import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

export default function NewSalesOrderPage() {
  return (
    <SalesPlaceholderPage
      eyebrow="New Sales Order"
      title="Create a new commercial order"
      description="Halaman ini akan menjadi tempat memilih customer, quotation source, item, price list, discount, tax, dan release control."
      highlights={['Order source', 'Item pricing', 'Credit check', 'Fulfillment handoff']}
      relatedLinks={[
        { href: '/app/sales/quotations', label: 'Sales quotations' },
        { href: '/app/sales/customer-credit', label: 'Customer credit' },
      ]}
    />
  );
}
