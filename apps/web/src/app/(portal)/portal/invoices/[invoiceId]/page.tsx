import { PortalPlaceholderPage } from '@/features/portal/portal-placeholder-page';

export default function PortalInvoiceDetailPage() {
  return (
    <PortalPlaceholderPage
      eyebrow="Portal / Invoice Detail"
      title="Review invoice amount, supporting files, and settlement history"
      description="Detail invoice menyatukan amount due, bukti pembayaran, receipt, dokumen unduhan, dan jalur support saat customer membutuhkan klarifikasi billing."
      highlights={[
        'Invoice status and due amount',
        'Payment proof and receipt trail',
        'Downloadable billing documents',
        'Billing dispute support path',
      ]}
      relatedLinks={[
        { href: '/portal/invoices', label: 'Back to invoices' },
        { href: '/portal/payments/PAY-2026-00302', label: 'Open related payment' },
        { href: '/portal/tickets/new', label: 'Open billing support ticket' },
      ]}
    />
  );
}
