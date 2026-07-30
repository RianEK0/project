import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

type CallLogDetailPageProps = {
  params: Promise<{
    callLogId: string;
  }>;
};

export default async function CallLogDetailPage({ params }: CallLogDetailPageProps) {
  const { callLogId } = await params;

  return (
    <CrmPlaceholderPage
      eyebrow="Call Log Detail"
      title={`Call Log ${callLogId}`}
      description="Detail call log akan menyimpan outcome, next step, dan hubungan ke lead atau opportunity terkait."
      highlights={['Outcome', 'Contact person', 'Next action', 'Linked record']}
      relatedLinks={[
        { href: '/app/crm/leads', label: 'Leads' },
        { href: '/app/crm/opportunities', label: 'Opportunities' },
      ]}
    />
  );
}
