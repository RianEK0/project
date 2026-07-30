import { ManufacturingPlaceholderPage } from '@/features/manufacturing/manufacturing-placeholder-page';

export default function MachinesPage() {
  return (
    <ManufacturingPlaceholderPage
      eyebrow="Manufacturing / Machine"
      title="Track machine availability, setup windows, and work-center readiness"
      description="Machine foundation menjadi master untuk capacity planning, routing assignment, dan maintenance scheduling sebelum telemetry serta OEE automation masuk pada sprint berikutnya."
      highlights={[
        'Available, setup, running, and down states',
        'Machine type and work-center grouping',
        'Capacity hour visibility',
        'Maintenance dependency starter',
      ]}
      relatedLinks={[
        { href: '/app/manufacturing/maintenance', label: 'Maintenance' },
        { href: '/app/manufacturing/capacity-planning', label: 'Capacity planning' },
        { href: '/app/manufacturing/routing', label: 'Routing' },
      ]}
    />
  );
}
