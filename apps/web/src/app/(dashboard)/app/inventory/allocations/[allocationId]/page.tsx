import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

type InventoryAllocationDetailPageProps = {
  params: Promise<{
    allocationId: string;
  }>;
};

export default async function InventoryAllocationDetailPage({
  params,
}: InventoryAllocationDetailPageProps) {
  const { allocationId } = await params;

  return (
    <OperationPlaceholderPage
      eyebrow="Allocation Detail"
      title={`Allocation ${allocationId}`}
      description="Detail allocation akan memperlihatkan sumber demand, strategi yang dipilih, candidate stock yang dipakai, shortage, dan status fulfillment dari alokasi tersebut."
      highlights={[
        `Allocation reference ${allocationId}`,
        'Candidate stock and strategy traceability',
        'Partial allocation and shortage visibility',
        'Release and fulfillment transition history',
      ]}
      relatedLinks={[
        { href: '/app/inventory/allocations', label: 'Allocation list' },
        { href: '/app/warehouse-operations/picking', label: 'Picking queue' },
      ]}
    />
  );
}
