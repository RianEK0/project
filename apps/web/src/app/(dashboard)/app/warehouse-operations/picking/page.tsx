import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

export default function PickingPage() {
  return (
    <OperationPlaceholderPage
      eyebrow="Picking"
      title="Picking task queue and execution status"
      description="Halaman picking mengikat task picking dari goods issue dan stock transfer, termasuk assignment, scan, pick-item, short-pick, dan completion state."
      highlights={[
        'Reservation fulfillment through task execution',
        'Source location, lot, and serial accuracy',
        'Short-pick workflow with exception handling',
        'Wave or direct task based orchestration',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/picking/waves', label: 'Picking waves' },
        { href: '/app/warehouse-operations/issues', label: 'Goods issues' },
      ]}
    />
  );
}
