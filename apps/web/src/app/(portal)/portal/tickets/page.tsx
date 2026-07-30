import { PortalPlaceholderPage } from '@/features/portal/portal-placeholder-page';

export default function PortalTicketsPage() {
  return (
    <PortalPlaceholderPage
      eyebrow="Portal / Tickets"
      title="Create, monitor, and close customer-facing support issues"
      description="Ticket list portal menyiapkan backlog untuk isu booking, order, invoice, payment, dokumen, dan technical support, lengkap dengan prioritas, status, dan SLA starter."
      highlights={[
        'Support queue by status and priority',
        'Transaction-linked issue intake',
        'Customer response waiting states',
        'Resolution and closure visibility',
      ]}
      relatedLinks={[
        { href: '/portal/tickets/new', label: 'Create new ticket' },
        { href: '/portal/tickets/TCK-2026-0009', label: 'Open sample ticket detail' },
        { href: '/portal/support', label: 'Open support center' },
      ]}
    />
  );
}
