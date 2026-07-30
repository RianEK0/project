import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

export default function StockAdjustmentsPage() {
  return (
    <OperationPlaceholderPage
      eyebrow="Stock Adjustment"
      title="Controlled adjustment and correction workspace"
      description="Halaman adjustment akan memusatkan proses koreksi stok, damage, expiration, reclassification, dan system correction dengan approval serta posting yang eksplisit."
      highlights={[
        'Reason code and approval requirements',
        'Adjustment posting and reversal control',
        'Sensitive mutation audit trail',
        'Status-aware quantity and cost handling',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/adjustments/new', label: 'Create adjustment' },
        { href: '/app/inventory/status-transfers', label: 'Status transfer workspace' },
      ]}
    />
  );
}
