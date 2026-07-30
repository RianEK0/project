import { ManufacturingPlaceholderPage } from '@/features/manufacturing/manufacturing-placeholder-page';

export default function ProductionPlanningPage() {
  return (
    <ManufacturingPlaceholderPage
      eyebrow="Manufacturing / Production Planning"
      title="Organize horizon, release discipline, and frozen-window planning"
      description="Production planning foundation menyiapkan daily, weekly, monthly, dan frozen window discipline agar order release ke shop floor lebih terkendali sebelum APS engine yang lebih dalam dibangun."
      highlights={[
        'Planning horizon starter',
        'Material and capacity feasibility gates',
        'Release and lock controls',
        'MRP and capacity linkage',
      ]}
      relatedLinks={[
        { href: '/app/manufacturing/mrp', label: 'MRP' },
        { href: '/app/manufacturing/capacity-planning', label: 'Capacity planning' },
        { href: '/app/manufacturing/production', label: 'Production' },
      ]}
    />
  );
}
