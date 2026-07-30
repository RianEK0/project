import { PortalPlaceholderPage } from '@/features/portal/portal-placeholder-page';

export default function PortalTrackingPage() {
  return (
    <PortalPlaceholderPage
      eyebrow="Portal / Tracking"
      title="Follow booking, order, billing, shipment, and support milestones in one timeline"
      description="Tracking page menjadi komposer customer-facing untuk milestone lintas domain, termasuk booking, order, invoice, payment, shipment, dan support ticket yang sedang memerlukan perhatian."
      highlights={[
        'Cross-domain milestone composition',
        'Scheduled, active, completed, and exception states',
        'Customer attention and next-action visibility',
        'Linked route back to transaction detail',
      ]}
      relatedLinks={[
        { href: '/portal/tracking/SHP-2026-00044', label: 'Open sample tracking detail' },
        { href: '/portal/bookings', label: 'Open bookings' },
        { href: '/portal/tickets/TCK-2026-0009', label: 'Open sample ticket detail' },
      ]}
    />
  );
}
