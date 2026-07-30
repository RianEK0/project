import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

type PickingTaskDetailPageProps = {
  params: Promise<{
    taskId: string;
  }>;
};

export default async function PickingTaskDetailPage({ params }: PickingTaskDetailPageProps) {
  const { taskId } = await params;

  return (
    <OperationPlaceholderPage
      eyebrow="Picking Task"
      title={`Picking ${taskId}`}
      description="Detail picking task akan merangkum source bin, allocated quantity, picked quantity, lot atau serial scan evidence, dan kemungkinan short-pick exception."
      highlights={[
        `Picking task ${taskId}`,
        'Allocated versus picked comparison',
        'Lot and serial validation guard rails',
        'Scan-first outbound execution evidence',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/picking', label: 'Picking queue' },
        { href: '/app/warehouse-operations/packing', label: 'Packing sessions' },
      ]}
    />
  );
}
