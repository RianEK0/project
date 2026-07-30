import { SectionPlaceholder } from '@/features/sprint-two/section-placeholder';

export default function BookingsPage() {
  return (
    <SectionPlaceholder
      eyebrow="Universal Booking"
      title="Booking control center"
      description="Sprint 2 menyiapkan kernel booking universal: status lifecycle, resource assignment, invoice linkage, dan payment trail yang siap diperdalam pada iterasi endpoint berikutnya."
      highlights={[
        'Booking header and item snapshots',
        'Booking resource reservations',
        'Booking notes and attachments',
        'Status history and reschedule trail',
      ]}
    />
  );
}
