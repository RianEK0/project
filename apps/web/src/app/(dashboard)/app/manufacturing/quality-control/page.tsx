import { ManufacturingPlaceholderPage } from '@/features/manufacturing/manufacturing-placeholder-page';

export default function QualityControlPage() {
  return (
    <ManufacturingPlaceholderPage
      eyebrow="Manufacturing / Quality Control"
      title="Capture inspection decisions, rework, and disposition on the production flow"
      description="Quality control starter memberi ruang untuk incoming, in-process, final, dan rework verification decisions tanpa membangun laboratory information system yang lebih detail pada sprint ini."
      highlights={[
        'Inspection checkpoint starter',
        'Accept, reject, rework, and sort decisions',
        'In-process and final inspection coverage',
        'Scrap and rework linkage',
      ]}
      relatedLinks={[
        { href: '/app/manufacturing/scrap', label: 'Scrap' },
        { href: '/app/manufacturing/work-orders', label: 'Work orders' },
        { href: '/app/manufacturing/production', label: 'Production' },
      ]}
    />
  );
}
