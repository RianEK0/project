import { PortalPlaceholderPage } from '@/features/portal/portal-placeholder-page';

export default function PortalInvoicesPage() {
  return (
    <PortalPlaceholderPage
      eyebrow="Portal / Invoices"
      title="Track billing status, payment readiness, and invoice document access"
      description="Halaman invoice portal menampilkan invoice yang telah diterbitkan, saldo terbuka, receipt status, serta akses cepat ke PDF dan dokumen penagihan lainnya."
      highlights={[
        'Open and overdue invoice visibility',
        'Invoice PDF and statement downloads',
        'Payment proof submission flow',
        'Collection-related notifications',
      ]}
      relatedLinks={[
        { href: '/portal/invoices/INV-2026-00431', label: 'Open sample invoice detail' },
        { href: '/portal/payments', label: 'Open payments' },
        { href: '/portal/downloads', label: 'Open download center' },
      ]}
    />
  );
}
