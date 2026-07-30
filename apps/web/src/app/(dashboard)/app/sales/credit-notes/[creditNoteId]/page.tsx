import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

type CreditNoteDetailPageProps = {
  params: Promise<{
    creditNoteId: string;
  }>;
};

export default async function CreditNoteDetailPage({ params }: CreditNoteDetailPageProps) {
  const { creditNoteId } = await params;

  return (
    <SalesPlaceholderPage
      eyebrow="Credit Note Detail"
      title={`Credit Note ${creditNoteId}`}
      description="Detail credit note akan menampilkan alasan koreksi, nilai kredit, invoice tujuan, dan status penerapan."
      highlights={['Correction reason', 'Credit amount', 'Target invoice', 'Apply status']}
      relatedLinks={[
        { href: '/app/sales/returns', label: 'Returns' },
        { href: '/app/sales/invoices', label: 'Sales invoices' },
      ]}
    />
  );
}
