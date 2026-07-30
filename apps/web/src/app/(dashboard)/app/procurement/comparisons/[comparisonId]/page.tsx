import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

type VendorComparisonDetailPageProps = {
  params: Promise<{
    comparisonId: string;
  }>;
};

export default async function VendorComparisonDetailPage({
  params,
}: VendorComparisonDetailPageProps) {
  const { comparisonId } = await params;

  return (
    <ProcurementPlaceholderPage
      eyebrow="Comparison Detail"
      title={`Comparison ${comparisonId}`}
      description="Detail comparison akan memperlihatkan ranking supplier, rationale skor, approval keputusan, dan handoff ke purchase order pemenang."
      highlights={[
        `Vendor comparison ${comparisonId}`,
        'Supplier ranking and rationale',
        'Approval and final decision trail',
        'PO handoff visibility',
      ]}
      relatedLinks={[
        { href: '/app/procurement/comparisons', label: 'All comparisons' },
        { href: '/app/procurement/orders', label: 'Purchase orders' },
      ]}
    />
  );
}
