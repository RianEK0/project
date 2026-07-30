import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

export default function SalesQuotationsPage() {
  return (
    <CrmPlaceholderPage
      eyebrow="Quotation"
      title="Send proposals before commercial close"
      description="Quotation foundation menyiapkan alur draft, sent, viewed, negotiation, accepted, dan converted."
      highlights={['Proposal status', 'Expiry control', 'Negotiation loop', 'Conversion path']}
      relatedLinks={[
        { href: '/app/crm/quotations/new', label: 'Create quotation' },
        { href: '/app/crm/deals', label: 'Deals' },
        { href: '/app/crm/pipeline', label: 'Pipeline' },
      ]}
    />
  );
}
