import { PortalPlaceholderPage } from '@/features/portal/portal-placeholder-page';

export default function PortalBookingsPage() {
  return (
    <PortalPlaceholderPage
      eyebrow="Portal / Bookings"
      title="Monitor upcoming reservations, voucher access, and self-service changes"
      description="Route ini menjadi pusat booking customer-facing untuk melihat reservasi aktif, dokumen terkait, status pembayaran, dan permintaan perubahan tanpa membuka dashboard internal NovaERP."
      highlights={[
        'Upcoming bookings and service windows',
        'Voucher and schedule readiness',
        'Reschedule and cancel request starter',
        'Booking-linked support escalation',
      ]}
      relatedLinks={[
        { href: '/portal/bookings/BKG-2026-00024', label: 'Open sample booking detail' },
        { href: '/portal/downloads', label: 'Open download center' },
        { href: '/portal/tracking', label: 'Open portal tracking' },
      ]}
    />
  );
}
