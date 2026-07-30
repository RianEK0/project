import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

export default function StockTransfersPage() {
  return (
    <OperationPlaceholderPage
      eyebrow="Stock Transfer"
      title="Internal and inter-warehouse transfer workspace"
      description="Daftar transfer akan mencakup internal warehouse relocation maupun inter-warehouse movement dengan approval, dispatch, in transit, receiving, dan putaway selesai."
      highlights={[
        'Internal and cross-warehouse transfer types',
        'Shipment and receipt checkpoints',
        'Transit inventory and discrepancy handling',
        'Transfer completion after receipt and putaway',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/transfers/new', label: 'Create transfer' },
        { href: '/app/warehouse-operations/dispatch', label: 'Dispatch records' },
      ]}
    />
  );
}
