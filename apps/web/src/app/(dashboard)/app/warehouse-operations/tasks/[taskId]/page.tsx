import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

type WarehouseTaskDetailPageProps = {
  params: Promise<{
    taskId: string;
  }>;
};

export default async function WarehouseTaskDetailPage({ params }: WarehouseTaskDetailPageProps) {
  const { taskId } = await params;

  return (
    <OperationPlaceholderPage
      eyebrow="Task Detail"
      title={`Task ${taskId}`}
      description="Detail task akan menggabungkan assignment history, status change, due date, sumber dokumen, dan tautan ke lane operasional asal seperti putaway atau picking."
      highlights={[
        `Warehouse task ${taskId}`,
        'Assignment and completion history',
        'Source document and workflow linkage',
        'Shared status language across warehouse lanes',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/tasks', label: 'Task board' },
        { href: '/app/warehouse-operations/tasks/my-tasks', label: 'My tasks' },
      ]}
    />
  );
}
