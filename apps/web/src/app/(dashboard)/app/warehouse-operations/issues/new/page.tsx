import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

export default function NewGoodsIssuePage() {
  return (
    <OperationPlaceholderPage
      eyebrow="New Issue"
      title="Create a controlled outbound issue"
      description="Form goods issue akan mengikat destination context, source workflow, allocation strategy, dan approval path sebelum stok benar-benar keluar dari warehouse."
      highlights={[
        'Issue request capture with destination context',
        'Allocation strategy and reservation linkage',
        'Picking and packing downstream generation',
        'No direct stock mutation from the UI layer',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/issues', label: 'Issue list' },
        { href: '/app/inventory/allocations', label: 'Allocation workspace' },
      ]}
    />
  );
}
