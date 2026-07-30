import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

type DispatchDetailPageProps = {
  params: Promise<{
    dispatchId: string;
  }>;
};

export default async function DispatchDetailPage({ params }: DispatchDetailPageProps) {
  const { dispatchId } = await params;

  return (
    <OperationPlaceholderPage
      eyebrow="Dispatch Detail"
      title={`Dispatch ${dispatchId}`}
      description="Detail dispatch akan menyajikan outbound vehicle info, carrier or driver context, linked issue or transfer shipment, dan timestamp dispatch aktual."
      highlights={[
        `Dispatch record ${dispatchId}`,
        'Carrier, driver, and tracking summary',
        'Issue or transfer shipment linkage',
        'Final outbound execution checkpoint',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/dispatch', label: 'Dispatch board' },
        { href: '/app/warehouse-operations/reports', label: 'Movement reports' },
      ]}
    />
  );
}
