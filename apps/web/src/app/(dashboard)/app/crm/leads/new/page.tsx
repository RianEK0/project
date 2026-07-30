import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

export default function NewLeadPage() {
  return (
    <CrmPlaceholderPage
      eyebrow="New Lead"
      title="Register a new prospect quickly"
      description="Route ini menyiapkan form lead baru dengan source, owner, initial note, dan follow up starter."
      highlights={['Prospect profile', 'Source channel', 'Owner assignment', 'Next action']}
      relatedLinks={[
        { href: '/app/crm/leads', label: 'Back to leads' },
        { href: '/app/crm/tasks', label: 'Sales tasks' },
      ]}
    />
  );
}
