import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

export default function CreditNotesPage() {
  return (
    <SalesPlaceholderPage
      eyebrow="Credit Note"
      title="Apply commercial corrections after return or invoice adjustment"
      description="Credit note foundation menyiapkan approval, issue, apply, dan void flow untuk koreksi komersial."
      highlights={['Approval flow', 'Issue state', 'Apply to invoice', 'Void control']}
      relatedLinks={[
        { href: '/app/sales/returns', label: 'Returns' },
        { href: '/app/sales/invoices', label: 'Sales invoices' },
      ]}
    />
  );
}
