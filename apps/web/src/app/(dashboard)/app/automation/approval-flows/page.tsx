import { AutomationPlaceholderPage } from '@/features/automation/automation-placeholder-page';

export default function ApprovalFlowsPage() {
  return (
    <AutomationPlaceholderPage
      eyebrow="Automation / Approval Flow"
      title="Route approval requests through threshold, role, and escalation logic"
      description="Approval Flow foundation menyiapkan jalur persetujuan lintas procurement, finance, HR, dan operasi sehingga dokumen enterprise dapat mengikuti routing yang konsisten sebelum workflow engine penuh hadir."
      highlights={[
        'Multi-step approval routing',
        'Threshold and department matching',
        'Escalation path starter',
        'Request status visibility',
      ]}
      relatedLinks={[
        { href: '/app/automation/rules', label: 'Automation rules' },
        { href: '/app/procurement/approvals', label: 'Procurement approvals' },
        { href: '/app/automation/reminders', label: 'Automation reminders' },
      ]}
    />
  );
}
