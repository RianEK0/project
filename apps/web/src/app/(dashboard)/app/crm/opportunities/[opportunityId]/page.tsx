import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

type OpportunityDetailPageProps = {
  params: Promise<{
    opportunityId: string;
  }>;
};

export default async function OpportunityDetailPage({ params }: OpportunityDetailPageProps) {
  const { opportunityId } = await params;

  return (
    <CrmPlaceholderPage
      eyebrow="Opportunity Detail"
      title={`Opportunity ${opportunityId}`}
      description="Halaman ini akan merangkum stage, quotation aktif, meeting plan, dan probability untuk opportunity terpilih."
      highlights={['Stage status', 'Linked quotation', 'Next meeting', 'Probability']}
      relatedLinks={[
        { href: '/app/crm/deals', label: 'View deals' },
        { href: '/app/crm/meetings', label: 'Sales meetings' },
      ]}
    />
  );
}
