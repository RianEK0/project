import { ManufacturingPlaceholderPage } from '@/features/manufacturing/manufacturing-placeholder-page';

export default function MaintenancePage() {
  return (
    <ManufacturingPlaceholderPage
      eyebrow="Manufacturing / Maintenance"
      title="Protect production continuity with preventive and corrective maintenance"
      description="Maintenance foundation menyiapkan preventive, corrective, calibration, dan breakdown workflow agar downtime machine bisa dikelola sebelum CMMS integration production hadir."
      highlights={[
        'Preventive and corrective work types',
        'Approval and completion checkpoints',
        'Breakdown and calibration triggers',
        'Machine availability linkage',
      ]}
      relatedLinks={[
        { href: '/app/manufacturing/machines', label: 'Machines' },
        { href: '/app/manufacturing/capacity-planning', label: 'Capacity planning' },
        { href: '/app/manufacturing/production', label: 'Production' },
      ]}
    />
  );
}
