import { PortalPlaceholderPage } from '@/features/portal/portal-placeholder-page';

export default function PortalDownloadsPage() {
  return (
    <PortalPlaceholderPage
      eyebrow="Portal / Downloads"
      title="Collect invoice PDFs, vouchers, receipts, and customer-facing proof"
      description="Download center menyiapkan katalog dokumen customer-facing yang siap diunduh atau sedang digenerate, sehingga customer dapat mengakses artefak penting tanpa permintaan manual ke tim internal."
      highlights={[
        'Invoice PDF and statement access',
        'Booking voucher retrieval',
        'Receipt and proof download status',
        'Generation and expiry visibility',
      ]}
      relatedLinks={[
        { href: '/portal/invoices', label: 'Open invoices' },
        { href: '/portal/bookings', label: 'Open bookings' },
        { href: '/portal/tracking/SHP-2026-00044', label: 'Open related shipment tracking' },
      ]}
    />
  );
}
