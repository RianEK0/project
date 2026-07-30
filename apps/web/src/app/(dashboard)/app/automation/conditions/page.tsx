import { AutomationPlaceholderPage } from '@/features/automation/automation-placeholder-page';

export default function AutomationConditionsPage() {
  return (
    <AutomationPlaceholderPage
      eyebrow="Automation / Condition"
      title="Compose matching logic for amount, status, owner, department, and signal windows"
      description="Condition foundation menyediakan operator pembanding dan komposisi logika agar rule bisa dievaluasi secara deterministik sebelum automation runtime penuh dijalankan."
      highlights={[
        'Equals and range operators',
        'List and contains matching',
        'ALL vs ANY composition',
        'Signal-based filter scopes',
      ]}
      relatedLinks={[
        { href: '/app/automation/rules', label: 'Automation rules' },
        { href: '/app/automation/actions', label: 'Automation actions' },
        { href: '/app/automation/approval-flows', label: 'Approval flow' },
      ]}
    />
  );
}
