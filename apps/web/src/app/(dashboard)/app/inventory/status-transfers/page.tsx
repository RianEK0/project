import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

export default function InventoryStatusTransfersPage() {
  return (
    <OperationPlaceholderPage
      eyebrow="Status Transfers"
      title="Inventory status change workspace"
      description="Status transfer menampung perpindahan stok antar status seperti available, quarantine, damaged, atau blocked dengan approval dan posting yang eksplisit."
      highlights={[
        'Available to quarantine or damage workflows',
        'Approval-aware sensitive mutation handling',
        'Location, lot, and serial-specific status changes',
        'Ledger-linked posting and audit visibility',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/adjustments', label: 'Adjustments' },
        { href: '/app/warehouse-operations/reports', label: 'Reports' },
      ]}
    />
  );
}
