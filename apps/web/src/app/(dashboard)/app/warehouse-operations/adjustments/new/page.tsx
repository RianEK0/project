import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

export default function NewStockAdjustmentPage() {
  return (
    <OperationPlaceholderPage
      eyebrow="New Adjustment"
      title="Submit a controlled stock correction"
      description="Form adjustment akan memandu user memasukkan reason code, warehouse, location, lot atau serial context, system quantity, counted quantity, dan approval route."
      highlights={[
        'Damage, expiration, loss, found, and reclassification support',
        'Reason code as mandatory business context',
        'No direct inventory balance edits from the client',
        'Reversal-only correction after posting',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/adjustments', label: 'Adjustment list' },
        { href: '/app/warehouse-operations/reports', label: 'Adjustment reporting' },
      ]}
    />
  );
}
