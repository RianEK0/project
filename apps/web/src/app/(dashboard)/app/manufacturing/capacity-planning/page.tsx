import { ManufacturingPlaceholderPage } from '@/features/manufacturing/manufacturing-placeholder-page';

export default function CapacityPlanningPage() {
  return (
    <ManufacturingPlaceholderPage
      eyebrow="Manufacturing / Capacity Planning"
      title="Balance work-center load against available hours and overtime buffer"
      description="Capacity planning starter memberi planner dan produksi pembacaan cepat terhadap balanced, overloaded, dan underutilized load agar sequencing dan overtime dapat diputuskan lebih awal."
      highlights={[
        'Shift, day, and week buckets',
        'Overload and underutilization signals',
        'Balancing lever starter',
        'Machine and routing linkage',
      ]}
      relatedLinks={[
        { href: '/app/manufacturing/machines', label: 'Machines' },
        { href: '/app/manufacturing/routing', label: 'Routing' },
        { href: '/app/manufacturing/planning', label: 'Production planning' },
      ]}
    />
  );
}
