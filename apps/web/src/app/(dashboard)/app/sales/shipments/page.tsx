import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

export default function ShipmentsPage() {
  return (
    <SalesPlaceholderPage
      eyebrow="Shipment"
      title="Track in-transit execution to customers"
      description="Shipment foundation memantau planned, in transit, delivered, failed, dan returned state sesudah dispatch."
      highlights={['Transit status', 'Proof of delivery', 'Failed delivery', 'Returned shipment']}
      relatedLinks={[
        { href: '/app/sales/delivery-orders', label: 'Delivery orders' },
        { href: '/app/sales/returns', label: 'Returns' },
      ]}
    />
  );
}
