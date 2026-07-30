import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

type SalesQuotationDetailPageProps = {
  params: Promise<{
    quotationId: string;
  }>;
};

export default async function SalesQuotationDetailPage({ params }: SalesQuotationDetailPageProps) {
  const { quotationId } = await params;

  return (
    <CrmPlaceholderPage
      eyebrow="Quotation Detail"
      title={`Quotation ${quotationId}`}
      description="Detail quotation akan memperlihatkan status commercial response, expiry, dan kesiapan convert ke deal atau close."
      highlights={['Status trail', 'Commercial terms', 'Expiry state', 'Conversion action']}
      relatedLinks={[
        { href: '/app/crm/deals', label: 'Deals' },
        { href: '/app/crm/timeline', label: 'Customer timeline' },
      ]}
    />
  );
}
