import { PortalPlaceholderPage } from '@/features/portal/portal-placeholder-page';

export default function PortalOrdersPage() {
  return (
    <PortalPlaceholderPage
      eyebrow="Portal / Orders"
      title="Follow commercial orders from approval through fulfillment"
      description="Halaman orders memperlihatkan order yang telah dikonversi dari quotation atau permintaan langsung, termasuk status fulfillment, shipment, invoice readiness, dan escalation path customer-facing."
      highlights={[
        'Order lifecycle visibility',
        'Fulfillment and shipment readiness',
        'Invoice and collection linkage',
        'Support context per order',
      ]}
      relatedLinks={[
        { href: '/portal/orders/SO-2026-01018', label: 'Open sample order detail' },
        { href: '/portal/invoices', label: 'Open invoices' },
        { href: '/portal/tracking', label: 'Open tracking timeline' },
      ]}
    />
  );
}
