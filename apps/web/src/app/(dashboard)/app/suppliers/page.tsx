import { SectionPlaceholder } from '@/features/sprint-two/section-placeholder';

export default function SuppliersPage() {
  return (
    <SectionPlaceholder
      eyebrow="Supplier Network"
      title="Vendor master data and replenishment context"
      description="Sprint 3A juga menambahkan supplier master data agar product sourcing, purchase lead time, preferred vendor, dan replenishment rule bisa dikaitkan ke katalog dan inventory sejak awal."
      highlights={[
        'Supplier master profile',
        'Preferred vendor per variant',
        'Lead time and MOQ placeholders',
        'Reorder and procurement readiness',
      ]}
      badgeLabel="Sprint 3A Foundation"
    />
  );
}
