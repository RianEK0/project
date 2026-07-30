import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

type InventoryStatusTransferDetailPageProps = {
  params: Promise<{
    statusTransferId: string;
  }>;
};

export default async function InventoryStatusTransferDetailPage({
  params,
}: InventoryStatusTransferDetailPageProps) {
  const { statusTransferId } = await params;

  return (
    <OperationPlaceholderPage
      eyebrow="Status Transfer Detail"
      title={`Status Transfer ${statusTransferId}`}
      description="Detail status transfer akan menampilkan before and after inventory status, quantity, location, lot atau serial context, serta approval dan posting trail."
      highlights={[
        `Status transfer ${statusTransferId}`,
        'From-status to to-status movement evidence',
        'Approval and posting sequence',
        'Location and lot or serial level traceability',
      ]}
      relatedLinks={[
        { href: '/app/inventory/status-transfers', label: 'Status transfer list' },
        { href: '/app/warehouse-operations/adjustments', label: 'Adjustments' },
      ]}
    />
  );
}
