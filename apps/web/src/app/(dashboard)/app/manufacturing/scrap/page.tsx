import { ManufacturingPlaceholderPage } from '@/features/manufacturing/manufacturing-placeholder-page';

export default function ScrapPage() {
  return (
    <ManufacturingPlaceholderPage
      eyebrow="Manufacturing / Scrap"
      title="Record production loss and rejected output with reason visibility"
      description="Scrap foundation membantu tim produksi dan quality mencatat process loss, setup loss, material defect, breakdown loss, dan reject output agar variance bisa dibaca lebih cepat."
      highlights={[
        'Reason type catalog starter',
        'Approval and analysis control',
        'Quality reject linkage',
        'Cost and variance direction',
      ]}
      relatedLinks={[
        { href: '/app/manufacturing/quality-control', label: 'Quality control' },
        { href: '/app/manufacturing/production', label: 'Production' },
        { href: '/app/manufacturing/planning', label: 'Production planning' },
      ]}
    />
  );
}
