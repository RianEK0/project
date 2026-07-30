import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

type LeadDetailPageProps = {
  params: Promise<{
    leadId: string;
  }>;
};

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { leadId } = await params;

  return (
    <CrmPlaceholderPage
      eyebrow="Lead Detail"
      title={`Lead ${leadId}`}
      description="Detail lead akan menampilkan status qualification, owner, recent activities, dan readiness untuk convert ke opportunity."
      highlights={['Status history', 'Lead notes', 'Follow up plan', 'Conversion path']}
      relatedLinks={[
        { href: '/app/crm/opportunities', label: 'See opportunities' },
        { href: '/app/crm/timeline', label: 'Customer timeline' },
      ]}
    />
  );
}
