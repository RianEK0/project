import { PortalPlaceholderPage } from '@/features/portal/portal-placeholder-page';

export default function PortalPaymentDetailPage() {
  return (
    <PortalPlaceholderPage
      eyebrow="Portal / Payment Detail"
      title="Inspect payment verification, receipt issue, and linked invoice context"
      description="Detail payment memperlihatkan metode, waktu pembayaran, file bukti, status verifikasi, dan receipt agar customer tahu apakah settlement sudah diterima atau masih memerlukan tindakan lanjutan."
      highlights={[
        'Payment status and verification notes',
        'Uploaded evidence and receipt linkage',
        'Invoice dependency and due amount context',
        'Escalation path for payment issues',
      ]}
      relatedLinks={[
        { href: '/portal/payments', label: 'Back to payments' },
        { href: '/portal/invoices/INV-2026-00431', label: 'Open related invoice' },
        { href: '/portal/tickets/new', label: 'Create payment support ticket' },
      ]}
    />
  );
}
