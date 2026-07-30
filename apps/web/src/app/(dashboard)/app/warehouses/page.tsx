import { SectionPlaceholder } from '@/features/sprint-two/section-placeholder';

export default function WarehousesPage() {
  return (
    <SectionPlaceholder
      eyebrow="Warehouse Layout"
      title="Warehouse, zone, and storage-location hierarchy"
      description="NovaERP sekarang punya fondasi warehouse yang terhubung ke tenant dan workspace, lengkap dengan zone fungsional, hierarchy storage location, kapasitas, dan aturan pick or quarantine."
      highlights={[
        'Warehouse master and operating profile',
        'Receiving, storage, and quarantine zones',
        'Nested aisle, rack, shelf, and bin structure',
        'Default stocking and pickable locations',
      ]}
      badgeLabel="Sprint 3A Foundation"
    />
  );
}
