import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

type StockCountDetailPageProps = {
  params: Promise<{
    countId: string;
  }>;
};

export default async function StockCountDetailPage({ params }: StockCountDetailPageProps) {
  const { countId } = await params;

  return (
    <OperationPlaceholderPage
      eyebrow="Count Detail"
      title={`Stock Count ${countId}`}
      description="Detail count session akan merangkum generated lines, counted quantity, variance, freeze state, approval decision, dan dokumen adjustment hasil posting."
      highlights={[
        `Count session ${countId}`,
        'Variance and freeze context',
        'Approval and posting progression',
        'Adjustment linkage after count close',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/stock-counts', label: 'All stock counts' },
        { href: '/app/warehouse-operations/adjustments', label: 'Adjustments' },
      ]}
    />
  );
}
