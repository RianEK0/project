import { ManufacturingPlaceholderPage } from '@/features/manufacturing/manufacturing-placeholder-page';

export default function ProductionPage() {
  return (
    <ManufacturingPlaceholderPage
      eyebrow="Manufacturing / Production"
      title="Coordinate production orders from release to close"
      description="Production foundation menjadi payung utama untuk make-to-stock, make-to-order, pilot, dan rework execution sebelum real-time machine telemetry dan costing automation dilanjutkan."
      highlights={[
        'Production order lifecycle starter',
        'Release and close controls',
        'Downstream work order linkage',
        'Quality and scrap feedback direction',
      ]}
      relatedLinks={[
        { href: '/app/manufacturing/work-orders', label: 'Work orders' },
        { href: '/app/manufacturing/quality-control', label: 'Quality control' },
        { href: '/app/manufacturing/scrap', label: 'Scrap' },
      ]}
    />
  );
}
