import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

export default function LeadsPage() {
  return (
    <CrmPlaceholderPage
      eyebrow="Lead"
      title="Capture and qualify early demand"
      description="Lead foundation menyiapkan intake dari phone, email, WhatsApp, referral, dan manual entry sebelum menjadi opportunity."
      highlights={['Lead sources', 'Qualification flow', 'Conversion readiness', 'Lead ownership']}
      relatedLinks={[
        { href: '/app/crm/leads/new', label: 'Create lead' },
        { href: '/app/crm/opportunities', label: 'Open opportunities' },
        { href: '/app/crm/funnel', label: 'Review sales funnel' },
      ]}
    />
  );
}
