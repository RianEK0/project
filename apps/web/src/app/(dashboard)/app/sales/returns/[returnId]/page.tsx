import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

type SalesReturnDetailPageProps = {
  params: Promise<{
    returnId: string;
  }>;
};

export default async function SalesReturnDetailPage({ params }: SalesReturnDetailPageProps) {
  const { returnId } = await params;

  return (
    <SalesPlaceholderPage
      eyebrow="Return Detail"
      title={`Return ${returnId}`}
      description="Detail return akan menampilkan approved quantity, inspection result, refund path, dan credit note eligibility."
      highlights={['Approved quantity', 'Inspection result', 'Refund path', 'Credit eligibility']}
      relatedLinks={[
        { href: '/app/sales/credit-notes', label: 'Credit notes' },
        { href: '/app/sales/invoices', label: 'Sales invoices' },
      ]}
    />
  );
}
