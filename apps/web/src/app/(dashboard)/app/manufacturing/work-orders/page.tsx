import { ManufacturingPlaceholderPage } from '@/features/manufacturing/manufacturing-placeholder-page';

export default function WorkOrdersPage() {
  return (
    <ManufacturingPlaceholderPage
      eyebrow="Manufacturing / Work Order"
      title="Run shop-floor execution with routing, readiness, and completion status"
      description="Work order starter menyiapkan dokumen eksekusi lantai produksi yang menghubungkan material readiness, machine readiness, operator readiness, dan QC hold dalam satu alur."
      highlights={[
        'Release, ready, in-progress, and completed states',
        'Routing and machine dependency',
        'Material and operator readiness signals',
        'Production and quality linkage',
      ]}
      relatedLinks={[
        { href: '/app/manufacturing/production', label: 'Production' },
        { href: '/app/manufacturing/routing', label: 'Routing' },
        { href: '/app/manufacturing/machines', label: 'Machines' },
      ]}
    />
  );
}
