import Link from 'next/link';

import { StatusBadge, SurfaceCard } from '@nova/ui';

const cards = [
  {
    href: '/app/automation/workflow-builder',
    label: 'Workflow Builder',
    description:
      'Design n8n-style flows with drag-and-drop triggers and actions for email, WhatsApp, Slack, Drive, PDF, and finance handoff.',
    badge: 'Builder',
  },
  {
    href: '/app/automation/rule-engine',
    label: 'Rule Engine',
    description:
      'Compose IF/THEN business rules for stock, invoice, lead time, payment delay, and operational escalation logic.',
    badge: 'Business Rule',
  },
  {
    href: '/app/automation/approval-flows',
    label: 'Approval Flow',
    description:
      'Model multi-step approval routing with escalation, role handoff, and threshold logic.',
    badge: 'Approval',
  },
  {
    href: '/app/automation/rules',
    label: 'Automation',
    description:
      'Define rule-driven orchestration from trigger and condition into executable actions.',
    badge: 'Rule',
  },
  {
    href: '/app/automation/triggers',
    label: 'Trigger',
    description:
      'Map document events, reminders, approvals, and cron ticks into automation entry points.',
    badge: 'Event',
  },
  {
    href: '/app/automation/conditions',
    label: 'Condition',
    description:
      'Compose matching logic for status, amount, owner, department, and operational signals.',
    badge: 'Logic',
  },
  {
    href: '/app/automation/actions',
    label: 'Action',
    description:
      'Queue approval creation, reminders, webhook calls, and cross-channel notifications.',
    badge: 'Effect',
  },
  {
    href: '/app/automation/reminders',
    label: 'Reminder',
    description:
      'Schedule pre-due, at-due, post-due, and escalation reminders across delivery channels.',
    badge: 'Reminder',
  },
  {
    href: '/app/automation/webhooks',
    label: 'Webhook',
    description:
      'Preview endpoint auth, retry policy, and event handoff for external automation sinks.',
    badge: 'Integration',
  },
  {
    href: '/app/automation/email',
    label: 'Email Automation',
    description:
      'Template approval alerts, digests, reminders, and escalation messages for email lanes.',
    badge: 'Email',
  },
  {
    href: '/app/automation/whatsapp',
    label: 'WhatsApp Automation',
    description:
      'Prepare conversational reminders and escalation pings for WhatsApp-based workflows.',
    badge: 'WhatsApp',
  },
  {
    href: '/app/automation/slack',
    label: 'Slack Automation',
    description:
      'Send approval, exception, and workflow signals into Slack channels or direct messages.',
    badge: 'Slack',
  },
  {
    href: '/app/automation/discord',
    label: 'Discord Automation',
    description: 'Support team or community workflow routing through Discord delivery patterns.',
    badge: 'Discord',
  },
  {
    href: '/app/automation/cron',
    label: 'Cron',
    description:
      'Preview recurring schedules for digest, reconciliation, and follow-up automation jobs.',
    badge: 'Schedule',
  },
] as const;

export function AutomationHub() {
  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-lime-700 dark:text-lime-300">
              Workflow Automation / Approval Orchestration
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Approval flows, event rules, reminders, channel delivery, and cron previews
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Approval Starter</StatusBadge>
            <StatusBadge tone="success">Rule Preview</StatusBadge>
            <StatusBadge tone="success">Channel Ready</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Workflow Automation foundation menyiapkan approval flow, trigger, condition, action,
          reminder, webhook, email, WhatsApp, Slack, Discord, dan cron preview tanpa langsung
          menjadi automation engine production penuh, plus workflow builder visual untuk orkestrasi
          drag-and-drop dan rule engine untuk IF/THEN business logic.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <SurfaceCard className="flex h-full flex-col justify-between gap-4 transition hover:-translate-y-0.5 hover:border-lime-300">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold">{card.label}</p>
                  <StatusBadge tone="neutral">{card.badge}</StatusBadge>
                </div>
                <p className="text-sm leading-6 text-muted">{card.description}</p>
              </div>
              <p className="text-sm font-medium text-lime-700 dark:text-lime-300">Open route</p>
            </SurfaceCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
