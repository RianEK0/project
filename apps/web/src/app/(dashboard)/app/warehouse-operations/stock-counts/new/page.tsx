import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

export default function NewStockCountPage() {
  return (
    <OperationPlaceholderPage
      eyebrow="New Count"
      title="Create a count session with freeze policy"
      description="Form stock count akan menentukan tipe count, scope, freeze behavior, scheduling, dan siapa yang bertanggung jawab untuk approval sebelum posting."
      highlights={[
        'Warehouse, zone, location, category, or product scope',
        'Freeze toggle for high-control sessions',
        'Scheduled execution and approval path',
        'Generated lines and variance workflow foundation',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/stock-counts', label: 'Count list' },
        { href: '/app/warehouse-operations/tasks', label: 'Warehouse tasks' },
      ]}
    />
  );
}
