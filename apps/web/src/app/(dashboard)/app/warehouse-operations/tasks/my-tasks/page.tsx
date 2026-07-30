import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

export default function MyWarehouseTasksPage() {
  return (
    <OperationPlaceholderPage
      eyebrow="My Tasks"
      title="Operator-focused personal task lane"
      description="View ini akan memfokuskan tugas yang sudah di-assign ke user aktif agar operator bisa menjalankan workflow harian tanpa harus membuka board warehouse yang lebih luas."
      highlights={[
        'Assigned-only operational focus',
        'Optimized for picking, putaway, count, and dispatch execution',
        'Scan-first task completion flow',
        'Clear handoff between supervisor planning and operator execution',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/tasks', label: 'All warehouse tasks' },
        { href: '/app/warehouse-operations/picking', label: 'Picking queue' },
      ]}
    />
  );
}
