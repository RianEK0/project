import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

export default function PickingWavesPage() {
  return (
    <OperationPlaceholderPage
      eyebrow="Picking Waves"
      title="Wave planning and release workspace"
      description="Route ini akan memusatkan grouping picking berdasarkan batch, zone, wave, priority, atau single-order strategy sebelum task execution dimulai."
      highlights={[
        'Wave strategy presets for Sprint 3B',
        'Release, start, complete, and cancel actions',
        'Warehouse workload balancing',
        'Task generation bridge into picking execution',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/picking', label: 'Picking queue' },
        { href: '/app/warehouse-operations/tasks', label: 'Warehouse tasks' },
      ]}
    />
  );
}
