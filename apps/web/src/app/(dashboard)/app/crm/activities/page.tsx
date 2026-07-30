import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

export default function ActivitiesPage() {
  return (
    <CrmPlaceholderPage
      eyebrow="Activity"
      title="Keep every sales action visible"
      description="Activity stream menyatukan call, email, WhatsApp, meeting, reminder, dan follow up ke satu daftar kerja."
      highlights={['Unified activity feed', 'Completion tracking', 'Owner queue', 'Next actions']}
      relatedLinks={[
        { href: '/app/crm/call-logs', label: 'Call logs' },
        { href: '/app/crm/tasks', label: 'Tasks' },
        { href: '/app/crm/meetings', label: 'Meetings' },
      ]}
    />
  );
}
