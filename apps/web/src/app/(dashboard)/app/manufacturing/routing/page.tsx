import { ManufacturingPlaceholderPage } from '@/features/manufacturing/manufacturing-placeholder-page';

export default function RoutingPage() {
  return (
    <ManufacturingPlaceholderPage
      eyebrow="Manufacturing / Routing"
      title="Define operation sequence, setup time, run time, and inspection points"
      description="Routing foundation memetakan cutting, assembly, machining, packaging, inspection, dan custom operations sebagai baseline scheduling dan work-center execution."
      highlights={[
        'Operation sequence starter',
        'Setup, run, queue, and move time base',
        'Inspection handoff points',
        'Work order scheduling direction',
      ]}
      relatedLinks={[
        { href: '/app/manufacturing/work-orders', label: 'Work orders' },
        { href: '/app/manufacturing/machines', label: 'Machines' },
        { href: '/app/manufacturing/capacity-planning', label: 'Capacity planning' },
      ]}
    />
  );
}
