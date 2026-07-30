import { PortalPlaceholderPage } from '@/features/portal/portal-placeholder-page';

export default function PortalOrderDetailPage() {
  return (
    <PortalPlaceholderPage
      eyebrow="Portal / Order Detail"
      title="See fulfillment handoff, shipment status, and invoice dependencies"
      description="Detail order customer-facing memusatkan status order, shipment, invoice, dan payment agar customer bisa memverifikasi progres delivery maupun dokumen komersial terkait."
      highlights={[
        'Commercial milestones',
        'Shipment handoff visibility',
        'Invoice dependency mapping',
        'Exception and support trigger points',
      ]}
      relatedLinks={[
        { href: '/portal/orders', label: 'Back to orders' },
        { href: '/portal/invoices/INV-2026-00431', label: 'Open related invoice' },
        { href: '/portal/support', label: 'Open support center' },
      ]}
    />
  );
}
