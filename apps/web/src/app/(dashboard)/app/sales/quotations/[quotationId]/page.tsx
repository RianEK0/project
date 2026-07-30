import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

type SalesQuotationDetailPageProps = {
  params: Promise<{
    quotationId: string;
  }>;
};

export default async function SalesQuotationDetailPage({ params }: SalesQuotationDetailPageProps) {
  const { quotationId } = await params;

  return (
    <SalesPlaceholderPage
      eyebrow="Quotation Detail"
      title={`Quotation ${quotationId}`}
      description="Detail quotation pada area sales akan menekankan kesiapan convert ke order dan dampaknya ke discount, tax, dan billing."
      highlights={['Convert to order', 'Discount context', 'Tax context', 'Billing impact']}
      relatedLinks={[
        { href: '/app/sales/orders/new', label: 'Create order' },
        { href: '/app/sales/price-lists', label: 'Price lists' },
      ]}
    />
  );
}
