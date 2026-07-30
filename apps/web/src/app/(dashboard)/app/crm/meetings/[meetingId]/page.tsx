import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

type SalesMeetingDetailPageProps = {
  params: Promise<{
    meetingId: string;
  }>;
};

export default async function SalesMeetingDetailPage({ params }: SalesMeetingDetailPageProps) {
  const { meetingId } = await params;

  return (
    <CrmPlaceholderPage
      eyebrow="Meeting Detail"
      title={`Meeting ${meetingId}`}
      description="Detail meeting akan menampilkan agenda, peserta, hasil, dan langkah lanjutan ke follow up atau quotation."
      highlights={['Agenda', 'Participants', 'Meeting result', 'Next step']}
      relatedLinks={[
        { href: '/app/crm/follow-ups', label: 'Follow ups' },
        { href: '/app/crm/quotations', label: 'Quotations' },
      ]}
    />
  );
}
