import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

export default function OpportunitiesPage() {
  return (
    <CrmPlaceholderPage
      eyebrow="Opportunity"
      title="Manage qualified commercial pursuit"
      description="Opportunity foundation mengatur stage discovery, solution fit, proposal, dan negotiation sampai close."
      highlights={['Stage progression', 'Owner accountability', 'Deal sizing', 'Close signals']}
      relatedLinks={[
        { href: '/app/crm/deals', label: 'View deals' },
        { href: '/app/crm/quotations', label: 'Sales quotations' },
        { href: '/app/crm/pipeline', label: 'Pipeline view' },
      ]}
    />
  );
}
