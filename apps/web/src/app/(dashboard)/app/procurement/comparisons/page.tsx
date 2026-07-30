import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

export default function VendorComparisonsPage() {
  return (
    <ProcurementPlaceholderPage
      eyebrow="Vendor Comparison"
      title="Scored sourcing decisions across suppliers"
      description="Vendor comparison membantu buyer dan procurement manager membandingkan quotation berdasarkan harga, lead time, kualitas, dan SLA historis."
      highlights={[
        'Weighted sourcing score',
        'Price, lead time, quality, and on-time signals',
        'Decision support before PO creation',
        'Traceable supplier recommendation',
      ]}
      relatedLinks={[
        { href: '/app/procurement/quotations', label: 'Supplier quotations' },
        { href: '/app/procurement/orders', label: 'Purchase orders' },
      ]}
    />
  );
}
