import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

type StockAdjustmentDetailPageProps = {
  params: Promise<{
    adjustmentId: string;
  }>;
};

export default async function StockAdjustmentDetailPage({
  params,
}: StockAdjustmentDetailPageProps) {
  const { adjustmentId } = await params;

  return (
    <OperationPlaceholderPage
      eyebrow="Adjustment Detail"
      title={`Adjustment ${adjustmentId}`}
      description="Detail adjustment akan merangkum item lines, before and after status context, approval history, posting decision, dan kemungkinan reversal bila diperlukan."
      highlights={[
        `Adjustment reference ${adjustmentId}`,
        'Item-level reason and status transfer context',
        'Approval, posting, and reversal trail',
        'Audit log alignment for sensitive mutations',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/adjustments', label: 'All adjustments' },
        { href: '/app/inventory/status-transfers', label: 'Status transfers' },
      ]}
    />
  );
}
