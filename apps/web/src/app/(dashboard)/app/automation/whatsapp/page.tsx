import { AutomationPlaceholderPage } from '@/features/automation/automation-placeholder-page';

export default function WhatsappAutomationPage() {
  return (
    <AutomationPlaceholderPage
      eyebrow="Automation / WhatsApp"
      title="Send conversational reminders and escalation prompts through WhatsApp"
      description="WhatsApp Automation foundation mempersiapkan jalur komunikasi yang lebih cepat untuk follow-up, approval ping, dan reminder lapangan tanpa menggandakan rule engine utama."
      highlights={[
        'WhatsApp reminder lane',
        'Escalation ping starter',
        'Fast-response workflow surface',
        'Template-safe message families',
      ]}
      relatedLinks={[
        { href: '/app/automation/reminders', label: 'Automation reminders' },
        { href: '/app/crm/whatsapp', label: 'CRM WhatsApp' },
        { href: '/app/automation/actions', label: 'Automation actions' },
      ]}
    />
  );
}
