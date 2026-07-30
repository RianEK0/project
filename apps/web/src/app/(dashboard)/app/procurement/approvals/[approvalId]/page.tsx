import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

type PurchaseApprovalDetailPageProps = {
  params: Promise<{
    approvalId: string;
  }>;
};

export default async function PurchaseApprovalDetailPage({
  params,
}: PurchaseApprovalDetailPageProps) {
  const { approvalId } = await params;

  return (
    <ProcurementPlaceholderPage
      eyebrow="Approval Detail"
      title={`Approval ${approvalId}`}
      description="Detail approval akan menunjukkan target dokumen procurement, approver chain, escalation, catatan keputusan, dan efeknya ke sourcing atau PO flow."
      highlights={[
        `Approval record ${approvalId}`,
        'Decision and escalation trace',
        'Linked procurement document',
        'Audit-ready approval narrative',
      ]}
      relatedLinks={[
        { href: '/app/procurement/approvals', label: 'Approval queue' },
        { href: '/app/procurement/requests', label: 'Purchase requests' },
      ]}
    />
  );
}
