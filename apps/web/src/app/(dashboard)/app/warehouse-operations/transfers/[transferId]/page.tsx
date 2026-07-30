import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

type StockTransferDetailPageProps = {
  params: Promise<{
    transferId: string;
  }>;
};

export default async function StockTransferDetailPage({ params }: StockTransferDetailPageProps) {
  const { transferId } = await params;

  return (
    <OperationPlaceholderPage
      eyebrow="Transfer Detail"
      title={`Transfer ${transferId}`}
      description="Detail transfer akan menampilkan shipment, receipt, discrepancy, transit inventory, dan jejak completion sampai barang tiba serta dipindahkan ke storage location tujuan."
      highlights={[
        `Transfer reference ${transferId}`,
        'Shipment and receipt documents',
        'Transit and discrepancy visibility',
        'Destination putaway completion',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/transfers', label: 'All transfers' },
        { href: '/app/warehouse-operations/putaway', label: 'Putaway tasks' },
      ]}
    />
  );
}
