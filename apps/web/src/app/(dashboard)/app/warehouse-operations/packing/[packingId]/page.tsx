import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

type PackingSessionDetailPageProps = {
  params: Promise<{
    packingId: string;
  }>;
};

export default async function PackingSessionDetailPage({ params }: PackingSessionDetailPageProps) {
  const { packingId } = await params;

  return (
    <OperationPlaceholderPage
      eyebrow="Packing Session"
      title={`Packing ${packingId}`}
      description="Detail packing session akan menampilkan item yang dipaketkan, package count, optional weight context, dan keterhubungan ke dispatch record berikutnya."
      highlights={[
        `Packing session ${packingId}`,
        'Packed item and package breakdown',
        'Weight and staging foundation',
        'Dispatch handoff readiness',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/packing', label: 'Packing sessions' },
        { href: '/app/warehouse-operations/dispatch', label: 'Dispatch records' },
      ]}
    />
  );
}
