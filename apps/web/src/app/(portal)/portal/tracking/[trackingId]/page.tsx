import { PortalPlaceholderPage } from '@/features/portal/portal-placeholder-page';

export default function PortalTrackingDetailPage() {
  return (
    <PortalPlaceholderPage
      eyebrow="Portal / Tracking Detail"
      title="Inspect a single milestone stream with exceptions and linked documents"
      description="Detail tracking akan memusatkan satu perjalanan customer-facing, termasuk milestone, dokumen, exception state, dan kaitannya dengan booking, shipment, invoice, atau support."
      highlights={[
        'Milestone-by-milestone visibility',
        'Exception and delay explanation',
        'Document and ticket linkage',
        'Next customer action guidance',
      ]}
      relatedLinks={[
        { href: '/portal/tracking', label: 'Back to tracking' },
        { href: '/portal/downloads', label: 'Open downloads' },
        { href: '/portal/support', label: 'Open support center' },
      ]}
    />
  );
}
