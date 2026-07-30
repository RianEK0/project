import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

export default function NewGoodsReceiptPage() {
  return (
    <OperationPlaceholderPage
      eyebrow="New Receipt"
      title="Create an inbound receipt document"
      description="Form pembuatan goods receipt akan memandu user memilih sumber, supplier, warehouse, receiving location, item lines, lot dan serial requirement, serta aturan inspection."
      highlights={[
        'Manual and placeholder source support',
        'Receiving location and warehouse validation',
        'Decimal quantity and cost capture',
        'Putaway-ready receiving foundation',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/receipts', label: 'Receipt list' },
        { href: '/app/warehouse-operations/scan', label: 'Scanning workflow' },
      ]}
    />
  );
}
