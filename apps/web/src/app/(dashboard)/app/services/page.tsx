import { SectionPlaceholder } from '@/features/sprint-two/section-placeholder';

export default function ServicesPage() {
  return (
    <SectionPlaceholder
      eyebrow="Service Catalog"
      title="Catalog, categories, and booking modes"
      description="Service catalog Sprint 2 dibangun universal, jadi satu fondasi yang sama bisa dipakai untuk appointment, rental, consultation, class, hingga date-range booking tanpa modul vertikal khusus."
      highlights={[
        'Nested service categories',
        'Universal booking modes',
        'Duration and buffer settings',
        'Approval and cancellation policy flags',
      ]}
    />
  );
}
