import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

export default function VendorPriceHistoryPage() {
  return (
    <ProcurementPlaceholderPage
      eyebrow="Vendor Price History"
      title="Quoted and actual purchase price history"
      description="Price history foundation merangkum evolusi harga vendor untuk membantu comparison dan negosiasi pembelian berikutnya."
      highlights={[
        'Historical quoted price view',
        'Actual purchase variance insight',
        'Repeat-buy negotiation context',
        'Input for vendor comparison weighting',
      ]}
      relatedLinks={[
        { href: '/app/procurement/vendors/performance', label: 'Vendor performance' },
        { href: '/app/procurement/comparisons', label: 'Vendor comparisons' },
      ]}
    />
  );
}
