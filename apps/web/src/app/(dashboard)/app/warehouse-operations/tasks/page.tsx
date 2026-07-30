import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

export default function WarehouseTasksPage() {
  return (
    <OperationPlaceholderPage
      eyebrow="Warehouse Tasks"
      title="Shared workload board for warehouse teams"
      description="Halaman task mengkonsolidasikan receiving, putaway, picking, packing, dispatch, replenishment, dan count tasks ke dalam satu board yang permission-aware."
      highlights={[
        'Assignment and workload balancing',
        'Priority and due-date aware execution',
        'Shared board for supervisor and operator roles',
        'Consistent task state model across workflows',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/tasks/my-tasks', label: 'My tasks' },
        { href: '/app/warehouse-operations/scan', label: 'Scanning workflow' },
      ]}
    />
  );
}
