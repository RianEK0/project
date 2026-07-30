import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

type SalesInvoiceDetailPageProps = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export default async function SalesInvoiceDetailPage({ params }: SalesInvoiceDetailPageProps) {
  const { invoiceId } = await params;

  return (
    <SalesPlaceholderPage
      eyebrow="Sales Invoice Detail"
      title={`Sales Invoice ${invoiceId}`}
      description="Detail sales invoice akan menampilkan issue state, collection progress, installment plan, dan correction path seperti credit note."
      highlights={['Issue state', 'Installments', 'Collection progress', 'Credit path']}
      relatedLinks={[
        { href: '/app/sales/credit-notes', label: 'Credit notes' },
        { href: '/app/payments', label: 'Payments' },
      ]}
    />
  );
}
