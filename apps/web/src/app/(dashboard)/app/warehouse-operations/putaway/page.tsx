import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

export default function PutawayPage() {
  return (
    <OperationPlaceholderPage
      eyebrow="Putaway"
      title="Putaway task execution board"
      description="Route ini menjadi rumah untuk tugas putaway dari goods receipt maupun transfer receipt agar stok bisa dipindahkan dari receiving atau staging ke storage location tujuan."
      highlights={[
        'Suggested versus actual storage location tracking',
        'Receiving and transfer receipt handoff',
        'Location override with explicit permission',
        'Task progress from assigned to completed',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/receipts', label: 'Goods receipts' },
        { href: '/app/warehouse-operations/transfers', label: 'Stock transfers' },
      ]}
    />
  );
}
