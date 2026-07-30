import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

type PutawayTaskDetailPageProps = {
  params: Promise<{
    taskId: string;
  }>;
};

export default async function PutawayTaskDetailPage({ params }: PutawayTaskDetailPageProps) {
  const { taskId } = await params;

  return (
    <OperationPlaceholderPage
      eyebrow="Putaway Task"
      title={`Putaway ${taskId}`}
      description="Detail putaway task akan menunjukkan stok sumber, lokasi usulan, lokasi aktual, quantity completion, dan scan event yang dipakai selama proses putaway."
      highlights={[
        `Putaway task ${taskId}`,
        'Source and target location traceability',
        'Completion quantity and scan evidence',
        'Receipt-linked inbound execution history',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/putaway', label: 'Putaway queue' },
        { href: '/app/warehouse-operations/scan', label: 'Scan workflow' },
      ]}
    />
  );
}
