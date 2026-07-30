import { PortalPlaceholderPage } from '@/features/portal/portal-placeholder-page';

export default function PortalSupportPage() {
  return (
    <PortalPlaceholderPage
      eyebrow="Portal / Support"
      title="Access support channels, service windows, and escalation paths"
      description="Support center adalah landing page bantuan pelanggan untuk melihat kanal komunikasi, target respon, kategori issue, dan jalur escalation tanpa harus mencari menu lain."
      highlights={[
        'Service window and first-response target',
        'Ticketing and escalation guidance',
        'Preferred channel visibility',
        'Cross-link to downloads and billing help',
      ]}
      relatedLinks={[
        { href: '/portal/tickets/new', label: 'Create new ticket' },
        { href: '/portal/downloads', label: 'Open downloads' },
        { href: '/portal/payments', label: 'Open payments' },
      ]}
    />
  );
}
