import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

type PriceListDetailPageProps = {
  params: Promise<{
    priceListId: string;
  }>;
};

export default async function PriceListDetailPage({ params }: PriceListDetailPageProps) {
  const { priceListId } = await params;

  return (
    <SalesPlaceholderPage
      eyebrow="Price List Detail"
      title={`Price List ${priceListId}`}
      description="Detail price list akan menampilkan cakupan customer/channel, masa berlaku, dan pengaruhnya ke quotation serta order."
      highlights={['Scope', 'Validity period', 'Item pricing', 'Quotation impact']}
      relatedLinks={[
        { href: '/app/sales/quotations', label: 'Sales quotations' },
        { href: '/app/sales/orders', label: 'Sales orders' },
      ]}
    />
  );
}
