import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

export default function SalesRemindersPage() {
  return (
    <CrmPlaceholderPage
      eyebrow="Reminder"
      title="Stay ahead of due follow ups"
      description="Reminder foundation membantu rep tidak melewatkan callback, proposal check-in, atau meeting prep."
      highlights={['Reminder queue', 'Due today', 'Missed reminders', 'Completion state']}
      relatedLinks={[
        { href: '/app/crm/tasks', label: 'Tasks' },
        { href: '/app/crm/follow-ups', label: 'Follow ups' },
      ]}
    />
  );
}
