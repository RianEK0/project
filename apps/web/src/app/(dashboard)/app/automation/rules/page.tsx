import { AutomationPlaceholderPage } from '@/features/automation/automation-placeholder-page';

export default function AutomationRulesPage() {
  return (
    <AutomationPlaceholderPage
      eyebrow="Automation / Rules"
      title="Translate business rules from trigger and condition into executable actions"
      description="Automation foundation menghubungkan trigger, condition, dan action agar tim bisa memodelkan rule operasional sebelum orchestration runtime production dibangun lebih dalam."
      highlights={[
        'Rule status model',
        'Condition evaluation preview',
        'Action queue starter',
        'Cross-domain orchestration handoff',
      ]}
      relatedLinks={[
        { href: '/app/automation/triggers', label: 'Automation triggers' },
        { href: '/app/automation/conditions', label: 'Automation conditions' },
        { href: '/app/automation/actions', label: 'Automation actions' },
      ]}
    />
  );
}
