import { SectionPlaceholder } from '@/features/sprint-two/section-placeholder';

export default function ResourcesPage() {
  return (
    <SectionPlaceholder
      eyebrow="Resource Management"
      title="Resources, groups, and capacity"
      description="Resource domain Sprint 2 mencakup staf, ruangan, kendaraan, equipment, dan aset virtual, lengkap dengan group, location binding, capacity, dan blocking period yang bisa dihitung engine availability."
      highlights={[
        'Resource groups and taxonomy',
        'Location-aware resources',
        'Capacity and quantity control',
        'Service-to-resource mapping',
      ]}
    />
  );
}
