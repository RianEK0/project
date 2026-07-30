import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

type DealDetailPageProps = {
  params: Promise<{
    dealId: string;
  }>;
};

export default async function DealDetailPage({ params }: DealDetailPageProps) {
  const { dealId } = await params;

  return (
    <CrmPlaceholderPage
      eyebrow="Deal Detail"
      title={`Deal ${dealId}`}
      description="Detail deal akan menjadi pusat negotiation summary, value, expected close, dan close decision log."
      highlights={['Deal value', 'Expected close', 'Negotiation trail', 'Win/loss notes']}
      relatedLinks={[
        { href: '/app/crm/quotations', label: 'Linked quotations' },
        { href: '/app/crm/timeline', label: 'Customer timeline' },
      ]}
    />
  );
}
