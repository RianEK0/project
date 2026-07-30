import { ManufacturingPlaceholderPage } from '@/features/manufacturing/manufacturing-placeholder-page';

export default function BillOfMaterialsPage() {
  return (
    <ManufacturingPlaceholderPage
      eyebrow="Manufacturing / Bill of Material"
      title="Structure multi-level BOM revisions and component explosion logic"
      description="Bill of material foundation menyiapkan komponen, subassembly, byproduct, dan consumable structure agar production, MRP, dan costing dapat membaca kebutuhan material dengan grain yang konsisten."
      highlights={[
        'Revision and effective-date control',
        'Multi-level explosion preview',
        'Component, subassembly, and byproduct lines',
        'Planning and production linkage',
      ]}
      relatedLinks={[
        { href: '/app/manufacturing/routing', label: 'Routing' },
        { href: '/app/manufacturing/mrp', label: 'MRP' },
        { href: '/app/manufacturing/production', label: 'Production' },
      ]}
    />
  );
}
