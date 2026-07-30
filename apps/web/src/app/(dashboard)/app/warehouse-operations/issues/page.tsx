import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

export default function GoodsIssuesPage() {
  return (
    <OperationPlaceholderPage
      eyebrow="Goods Issue"
      title="Outbound issue staging for allocations and dispatch"
      description="Halaman ini akan menampung daftar goods issue yang bergerak dari request, approval, allocation, picking, packing, dispatch, hingga issue posting."
      highlights={[
        'Reservation-aware outbound control',
        'Picking and packing handoff',
        'Approval and posting permission boundaries',
        'Ledger-linked issue completion',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/issues/new', label: 'Create issue' },
        { href: '/app/warehouse-operations/picking', label: 'Picking tasks' },
      ]}
    />
  );
}
