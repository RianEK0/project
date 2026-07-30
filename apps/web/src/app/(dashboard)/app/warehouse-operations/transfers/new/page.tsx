import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

export default function NewStockTransferPage() {
  return (
    <OperationPlaceholderPage
      eyebrow="New Transfer"
      title="Plan a controlled stock transfer"
      description="Form transfer akan menangkap warehouse asal, warehouse tujuan, optional transit warehouse, item lines, dan approval policy sebelum picking atau dispatch dimulai."
      highlights={[
        'Origin, destination, and transit modeling',
        'Allocation-aware transfer lines',
        'Picking and dispatch downstream generation',
        'Receipt and putaway continuation at destination',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/transfers', label: 'Transfer list' },
        { href: '/app/warehouse-operations/picking/waves', label: 'Picking waves' },
      ]}
    />
  );
}
