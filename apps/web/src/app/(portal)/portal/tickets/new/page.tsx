import { PortalPlaceholderPage } from '@/features/portal/portal-placeholder-page';

export default function PortalNewTicketPage() {
  return (
    <PortalPlaceholderPage
      eyebrow="Portal / New Ticket"
      title="Submit a new support issue with transaction and priority context"
      description="Form ticket baru akan menjadi entrypoint untuk memilih kategori issue, referensi transaksi, prioritas, lampiran, dan preferred communication channel customer."
      highlights={[
        'Issue category and channel selection',
        'Booking, order, invoice, or payment reference',
        'Priority and SLA expectation',
        'Attachment and follow-up preference',
      ]}
      relatedLinks={[
        { href: '/portal/tickets', label: 'Back to tickets' },
        { href: '/portal/bookings', label: 'Browse bookings' },
        { href: '/portal/invoices', label: 'Browse invoices' },
      ]}
    />
  );
}
