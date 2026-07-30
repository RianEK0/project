import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

export default function WarehouseScanPage() {
  return (
    <OperationPlaceholderPage
      eyebrow="Scanning"
      title="Barcode, lot, serial, and location scan workflow"
      description="Route scan menyiapkan session scanning untuk product, barcode, lot, serial, warehouse, storage location, document, dan package code di Sprint 3B."
      highlights={[
        'Prefix-aware code resolution service',
        'Numeric barcode fallback support',
        'Scan history and task-linked sessions',
        'Reusable foundation for mobile warehouse execution',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/tasks/my-tasks', label: 'My tasks' },
        { href: '/app/warehouse-operations/putaway', label: 'Putaway queue' },
      ]}
    />
  );
}
