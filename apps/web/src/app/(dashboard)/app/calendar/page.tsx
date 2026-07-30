import { SectionPlaceholder } from '@/features/sprint-two/section-placeholder';

export default function CalendarPage() {
  return (
    <SectionPlaceholder
      eyebrow="Availability Engine"
      title="Calendar and slot orchestration"
      description="Area ini disiapkan untuk menampilkan business hours, schedule exceptions, resource blocks, dan slot collision awareness yang menjadi inti pencegahan double booking."
      highlights={[
        'Business hours precedence',
        'Schedule exception overlays',
        'Resource block visibility',
        'Overlap-safe slot evaluation',
      ]}
    />
  );
}
