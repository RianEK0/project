import { PortalPlaceholderPage } from '@/features/portal/portal-placeholder-page';

export default function PortalPaymentsPage() {
  return (
    <PortalPlaceholderPage
      eyebrow="Portal / Payments"
      title="Review balances, payment proof, and verification progress"
      description="Halaman payments customer portal berfungsi sebagai pusat settlement untuk melihat saldo terbuka, histori pembayaran, metode yang diterima, dan status verifikasi bukti bayar."
      highlights={[
        'Open balance and receipt visibility',
        'Manual proof submission flow',
        'Verification and rejection context',
        'Invoice-linked settlement history',
      ]}
      relatedLinks={[
        { href: '/portal/payments/PAY-2026-00302', label: 'Open sample payment detail' },
        { href: '/portal/invoices', label: 'Open invoices' },
        { href: '/portal/support', label: 'Open support center' },
      ]}
    />
  );
}
