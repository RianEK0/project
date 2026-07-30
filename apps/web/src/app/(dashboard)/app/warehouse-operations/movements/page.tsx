import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

export default function InventoryMovementsPage() {
  return (
    <OperationPlaceholderPage
      eyebrow="Movement Engine"
      title="Generic stock movement control tower"
      description="Halaman ini menjadi titik masuk untuk inventory movement engine generik yang memayungi receipt, issue, transfer, adjustment, status transfer, putaway, pick, dispatch, dan reversal."
      highlights={[
        'Explicit movement status transitions',
        'Append-only ledger and reversal safety',
        'Idempotent movement numbering and audit trail',
        'Cross-flow orchestration for inbound and outbound lanes',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/dashboard', label: 'Back to dashboard' },
        { href: '/app/warehouse-operations/reports', label: 'Movement reports' },
      ]}
    />
  );
}
