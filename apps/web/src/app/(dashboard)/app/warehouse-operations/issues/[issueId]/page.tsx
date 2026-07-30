import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

type GoodsIssueDetailPageProps = {
  params: Promise<{
    issueId: string;
  }>;
};

export default async function GoodsIssueDetailPage({ params }: GoodsIssueDetailPageProps) {
  const { issueId } = await params;

  return (
    <OperationPlaceholderPage
      eyebrow="Issue Detail"
      title={`Issue ${issueId}`}
      description="Detail goods issue akan menggabungkan status approval, allocation result, picking progress, packing readiness, dispatch record, dan ledger keluar."
      highlights={[
        `Issue reference ${issueId}`,
        'Allocation and picking execution trail',
        'Packing and dispatch readiness',
        'Posted issue immutability with movement reversal path',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/issues', label: 'All issues' },
        { href: '/app/warehouse-operations/dispatch', label: 'Dispatch board' },
      ]}
    />
  );
}
