import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

type PurchaseInvoicePreparationDetailPageProps = {
  params: Promise<{
    preparationId: string;
  }>;
};

export default async function PurchaseInvoicePreparationDetailPage({
  params,
}: PurchaseInvoicePreparationDetailPageProps) {
  const { preparationId } = await params;

  return (
    <ProcurementPlaceholderPage
      eyebrow="Invoice Prep Detail"
      title={`Invoice Preparation ${preparationId}`}
      description="Detail invoice preparation akan menunjukkan receipt coverage, exception, blocked reason, dan kesiapan handoff ke journal atau voucher finance."
      highlights={[
        `Invoice preparation ${preparationId}`,
        'Receipt and PO coverage summary',
        'Blocked reason visibility',
        'Finance handoff preparation',
      ]}
      relatedLinks={[
        { href: '/app/procurement/invoice-preparation', label: 'Invoice preparation' },
        { href: '/app/invoices', label: 'Invoices' },
        { href: '/app/finance/vouchers', label: 'Finance vouchers' },
      ]}
    />
  );
}
