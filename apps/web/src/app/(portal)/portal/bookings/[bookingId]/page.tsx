import { PortalPlaceholderPage } from '@/features/portal/portal-placeholder-page';

export default function PortalBookingDetailPage() {
  return (
    <PortalPlaceholderPage
      eyebrow="Portal / Booking Detail"
      title="Review booking milestones, linked documents, and support history"
      description="Detail booking portal akan menampilkan voucher, waktu layanan, invoice terkait, payment proof, dan ticket yang berhubungan agar customer memiliki satu layar untuk menindaklanjuti reservasinya."
      highlights={[
        'Booking status and timeline',
        'Invoice and payment linkage',
        'Voucher and document downloads',
        'Issue reporting from the booking context',
      ]}
      relatedLinks={[
        { href: '/portal/bookings', label: 'Back to bookings' },
        { href: '/portal/tickets/new', label: 'Create support ticket' },
        { href: '/portal/tracking/SHP-2026-00044', label: 'Open related tracking' },
      ]}
    />
  );
}
