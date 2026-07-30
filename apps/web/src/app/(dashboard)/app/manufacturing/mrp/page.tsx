import { ManufacturingPlaceholderPage } from '@/features/manufacturing/manufacturing-placeholder-page';

export default function MrpPage() {
  return (
    <ManufacturingPlaceholderPage
      eyebrow="Manufacturing / MRP"
      title="Preview shortages, lot sizing, and replenishment recommendations"
      description="MRP foundation menyediakan preview shortage, lot-sized planned order receipt, dan exception starter agar planner bisa membaca gap material sebelum purchase atau production supply dipicu."
      highlights={[
        'Net requirement preview',
        'Shortage and excess exception starter',
        'Supply source visibility',
        'BOM and planning linkage',
      ]}
      relatedLinks={[
        { href: '/app/manufacturing/bill-of-materials', label: 'Bill of material' },
        { href: '/app/manufacturing/planning', label: 'Production planning' },
        { href: '/app/procurement/requests', label: 'Procurement requests' },
      ]}
    />
  );
}
