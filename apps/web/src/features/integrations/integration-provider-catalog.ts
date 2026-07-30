import type { IntegrationProviderCategory, IntegrationProviderKey } from '@nova/shared-types';

export type IntegrationProviderSlug =
  | 'stripe'
  | 'xendit'
  | 'midtrans'
  | 'google'
  | 'microsoft'
  | 'whatsapp'
  | 'telegram'
  | 'slack'
  | 'discord'
  | 'dropbox'
  | 'google-drive'
  | 'onedrive'
  | 's3'
  | 'openai'
  | 'claude'
  | 'gemini';

export type IntegrationProviderItem = {
  slug: IntegrationProviderSlug;
  key: IntegrationProviderKey;
  category: IntegrationProviderCategory;
  href: string;
  label: string;
  badge: string;
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  relatedLinks: Array<{
    href: string;
    label: string;
  }>;
  eyebrowClassName: string;
  hoverClassName: string;
  actionClassName: string;
  apiPreview: 'payments' | 'suite' | 'messaging' | 'storage' | 'ai';
};

export type IntegrationCategoryCard = {
  id: string;
  label: string;
  badge: string;
  summary: string;
  className: string;
};

export const integrationCategoryCards: IntegrationCategoryCard[] = [
  {
    id: 'payments',
    label: 'Payments',
    badge: '3 providers',
    summary:
      'Stripe, Xendit, dan Midtrans menjadi lane untuk capture, callback, settlement, dan finance handoff.',
    className: 'border-amber-200/80 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20',
  },
  {
    id: 'suite',
    label: 'Suite',
    badge: '2 providers',
    summary:
      'Google dan Microsoft mengikat identity, calendar, dan collaboration readiness ke tenant workspace.',
    className: 'border-sky-200/80 bg-sky-50/70 dark:border-sky-900/60 dark:bg-sky-950/20',
  },
  {
    id: 'messaging',
    label: 'Messaging',
    badge: '4 providers',
    summary:
      'WhatsApp, Telegram, Slack, dan Discord disatukan sebagai control plane untuk conversational delivery.',
    className:
      'border-violet-200/80 bg-violet-50/70 dark:border-violet-900/60 dark:bg-violet-950/20',
  },
  {
    id: 'storage',
    label: 'Storage',
    badge: '4 providers',
    summary:
      'Dropbox, Google Drive, OneDrive, dan S3 meng-cover exchange, archive, signed delivery, dan redundancy.',
    className:
      'border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/20',
  },
  {
    id: 'ai',
    label: 'AI',
    badge: '3 providers',
    summary:
      'OpenAI, Claude, dan Gemini menyiapkan multi-provider routing untuk copilot dan analytics lane.',
    className: 'border-rose-200/80 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/20',
  },
];

export const integrationProviderCatalog: IntegrationProviderItem[] = [
  {
    slug: 'stripe',
    key: 'STRIPE',
    category: 'PAYMENT',
    href: '/app/integrations/stripe',
    label: 'Stripe',
    badge: 'Payments',
    eyebrow: 'Stripe',
    title: 'Prepare global payment orchestration for invoices, links, and subscriptions',
    description:
      'Stripe lane memusatkan capture, webhook, settlement, dan finance handoff tanpa mencampur ulang logic invoice atau payment record yang sudah ada.',
    highlights: [
      'Card and link collection readiness',
      'Webhook and settlement orchestration',
      'Invoice and portal payment linkage',
      'Finance reconciliation handoff',
    ],
    relatedLinks: [
      { href: '/app/payments', label: 'Payments' },
      { href: '/app/sales/invoices', label: 'Sales invoices' },
      { href: '/portal/dashboard', label: 'Portal dashboard' },
    ],
    eyebrowClassName: 'text-amber-700 dark:text-amber-300',
    hoverClassName: 'hover:border-amber-300',
    actionClassName: 'text-amber-700 dark:text-amber-300',
    apiPreview: 'payments',
  },
  {
    slug: 'xendit',
    key: 'XENDIT',
    category: 'PAYMENT',
    href: '/app/integrations/xendit',
    label: 'Xendit',
    badge: 'Payments',
    eyebrow: 'Xendit',
    title: 'Anchor Indonesia-native payment channels into NovaERP finance and portal flow',
    description:
      'Xendit lane mengikat virtual account, QRIS, dan e-wallet readiness ke invoice, payment, dan reconciliation surfaces.',
    highlights: [
      'Virtual account readiness',
      'QRIS and e-wallet support lane',
      'Webhook-first payment state sync',
      'Local settlement visibility',
    ],
    relatedLinks: [
      { href: '/app/payments', label: 'Payments' },
      { href: '/app/finance/cash-flow', label: 'Cash flow' },
      { href: '/portal/dashboard', label: 'Portal dashboard' },
    ],
    eyebrowClassName: 'text-amber-700 dark:text-amber-300',
    hoverClassName: 'hover:border-amber-300',
    actionClassName: 'text-amber-700 dark:text-amber-300',
    apiPreview: 'payments',
  },
  {
    slug: 'midtrans',
    key: 'MIDTRANS',
    category: 'PAYMENT',
    href: '/app/integrations/midtrans',
    label: 'Midtrans',
    badge: 'Payments',
    eyebrow: 'Midtrans',
    title: 'Keep a regional payment fallback ready for redundancy and tenant preference',
    description:
      'Midtrans lane memberi jalur redundansi payment gateway untuk tenant yang butuh channel regional dan fallback checkout.',
    highlights: [
      'Regional checkout fallback',
      'Async callback alignment',
      'Order and invoice handoff',
      'Gateway redundancy planning',
    ],
    relatedLinks: [
      { href: '/app/payments', label: 'Payments' },
      { href: '/app/sales/orders', label: 'Sales orders' },
      { href: '/app/finance/exchange-rates', label: 'Exchange rates' },
    ],
    eyebrowClassName: 'text-amber-700 dark:text-amber-300',
    hoverClassName: 'hover:border-amber-300',
    actionClassName: 'text-amber-700 dark:text-amber-300',
    apiPreview: 'payments',
  },
  {
    slug: 'google',
    key: 'GOOGLE',
    category: 'SUITE',
    href: '/app/integrations/google',
    label: 'Google',
    badge: 'Suite',
    eyebrow: 'Google',
    title: 'Connect Google identity, calendar, and collaboration into tenant workspace setup',
    description:
      'Google lane memposisikan OAuth, directory, calendar, dan workspace collaboration sebagai control plane lintas module.',
    highlights: [
      'Identity and consent readiness',
      'Calendar synchronization lane',
      'Workspace collaboration alignment',
      'Tenant onboarding linkage',
    ],
    relatedLinks: [
      { href: '/app/settings', label: 'Settings' },
      { href: '/app/mobile/push-notification', label: 'Mobile push' },
      { href: '/app/automation/email', label: 'Email automation' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
    apiPreview: 'suite',
  },
  {
    slug: 'microsoft',
    key: 'MICROSOFT',
    category: 'SUITE',
    href: '/app/integrations/microsoft',
    label: 'Microsoft',
    badge: 'Suite',
    eyebrow: 'Microsoft',
    title: 'Support Entra, Outlook, and Microsoft 365 collaboration as enterprise tenant defaults',
    description:
      'Microsoft lane menyiapkan identity, schedule, dan collaboration handoff untuk tenant yang beroperasi di stack M365.',
    highlights: [
      'Entra identity readiness',
      'Outlook and schedule sync',
      'M365 document collaboration',
      'Enterprise consent governance',
    ],
    relatedLinks: [
      { href: '/app/settings', label: 'Settings' },
      { href: '/app/automation/email', label: 'Email automation' },
      { href: '/app/hr/organization-chart', label: 'Organization chart' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
    apiPreview: 'suite',
  },
  {
    slug: 'whatsapp',
    key: 'WHATSAPP',
    category: 'MESSAGING',
    href: '/app/integrations/whatsapp',
    label: 'WhatsApp',
    badge: 'Messaging',
    eyebrow: 'WhatsApp',
    title: 'Use WhatsApp as a governed customer and operational messaging rail',
    description:
      'WhatsApp lane menyatukan CRM, automation, reminder, dan approval notice ke channel percakapan yang paling dekat dengan pengguna.',
    highlights: [
      'Customer messaging control plane',
      'Template and callback readiness',
      'CRM and automation linkage',
      'Acknowledgement workflow starter',
    ],
    relatedLinks: [
      { href: '/app/crm/whatsapp', label: 'CRM WhatsApp' },
      { href: '/app/automation/whatsapp', label: 'WhatsApp automation' },
      { href: '/app/automation/reminders', label: 'Automation reminders' },
    ],
    eyebrowClassName: 'text-violet-700 dark:text-violet-300',
    hoverClassName: 'hover:border-violet-300',
    actionClassName: 'text-violet-700 dark:text-violet-300',
    apiPreview: 'messaging',
  },
  {
    slug: 'telegram',
    key: 'TELEGRAM',
    category: 'MESSAGING',
    href: '/app/integrations/telegram',
    label: 'Telegram',
    badge: 'Messaging',
    eyebrow: 'Telegram',
    title: 'Operate lightweight bot and exception relay flows through Telegram',
    description:
      'Telegram lane memfokuskan alerting cepat, bot workflow, dan acknowledgement ringan untuk tim operasi dan exception handling.',
    highlights: [
      'Ops bot readiness',
      'Exception relay lane',
      'Quick acknowledgement flow',
      'Low-friction pilot channel',
    ],
    relatedLinks: [
      { href: '/app/automation/webhooks', label: 'Automation webhooks' },
      { href: '/app/warehouse-operations/tasks/my-tasks', label: 'My tasks' },
      { href: '/app/automation/reminders', label: 'Automation reminders' },
    ],
    eyebrowClassName: 'text-violet-700 dark:text-violet-300',
    hoverClassName: 'hover:border-violet-300',
    actionClassName: 'text-violet-700 dark:text-violet-300',
    apiPreview: 'messaging',
  },
  {
    slug: 'slack',
    key: 'SLACK',
    category: 'MESSAGING',
    href: '/app/integrations/slack',
    label: 'Slack',
    badge: 'Messaging',
    eyebrow: 'Slack',
    title: 'Route internal approvals, warehouse exceptions, and AI alerts into Slack',
    description:
      'Slack lane memusatkan internal notification, approval nudge, dan copilot signal ke channel kolaborasi internal yang terukur.',
    highlights: [
      'Internal notification routing',
      'Approval prompt linkage',
      'Warehouse and AI exception relay',
      'Interactive action starter',
    ],
    relatedLinks: [
      { href: '/app/automation/slack', label: 'Slack automation' },
      { href: '/app/automation/approval-flows', label: 'Approval flows' },
      { href: '/app/ai/analytics', label: 'AI analytics' },
    ],
    eyebrowClassName: 'text-violet-700 dark:text-violet-300',
    hoverClassName: 'hover:border-violet-300',
    actionClassName: 'text-violet-700 dark:text-violet-300',
    apiPreview: 'messaging',
  },
  {
    slug: 'discord',
    key: 'DISCORD',
    category: 'MESSAGING',
    href: '/app/integrations/discord',
    label: 'Discord',
    badge: 'Messaging',
    eyebrow: 'Discord',
    title: 'Pilot community-style notifications and low-friction event fan-out via Discord',
    description:
      'Discord lane memberi kanal eksperimen untuk event relay, support community, atau internal pilot tanpa mengganggu channel utama.',
    highlights: [
      'Community-style alerting',
      'Pilot integration sandbox',
      'Webhook and bot control',
      'Operational event fan-out',
    ],
    relatedLinks: [
      { href: '/app/automation/discord', label: 'Discord automation' },
      { href: '/portal/dashboard', label: 'Portal dashboard' },
      { href: '/app/automation/webhooks', label: 'Automation webhooks' },
    ],
    eyebrowClassName: 'text-violet-700 dark:text-violet-300',
    hoverClassName: 'hover:border-violet-300',
    actionClassName: 'text-violet-700 dark:text-violet-300',
    apiPreview: 'messaging',
  },
  {
    slug: 'dropbox',
    key: 'DROPBOX',
    category: 'STORAGE',
    href: '/app/integrations/dropbox',
    label: 'Dropbox',
    badge: 'Storage',
    eyebrow: 'Dropbox',
    title: 'Prepare shared document exchange with tenant-safe folder and access control',
    description:
      'Dropbox lane menyiapkan pertukaran dokumen lintas tenant dan customer-facing export dengan fokus pada signed access dan retention.',
    highlights: [
      'Shared document exchange',
      'Folder policy starter',
      'Signed delivery readiness',
      'Customer-facing export handoff',
    ],
    relatedLinks: [
      { href: '/portal/dashboard', label: 'Portal dashboard' },
      { href: '/app/automation/webhooks', label: 'Automation webhooks' },
      { href: '/app/mobile/pwa', label: 'Mobile PWA' },
    ],
    eyebrowClassName: 'text-emerald-700 dark:text-emerald-300',
    hoverClassName: 'hover:border-emerald-300',
    actionClassName: 'text-emerald-700 dark:text-emerald-300',
    apiPreview: 'storage',
  },
  {
    slug: 'google-drive',
    key: 'GOOGLE_DRIVE',
    category: 'STORAGE',
    href: '/app/integrations/google-drive',
    label: 'Google Drive',
    badge: 'Storage',
    eyebrow: 'Google Drive',
    title: 'Support collaborative document handoff through Google Drive with policy controls',
    description:
      'Google Drive lane memusatkan folder collaboration, retention label, dan document sharing yang tetap tenant-safe.',
    highlights: [
      'Collaborative file handoff',
      'Retention label coverage',
      'Shared folder governance',
      'Workspace-linked export path',
    ],
    relatedLinks: [
      { href: '/app/settings', label: 'Settings' },
      { href: '/portal/dashboard', label: 'Portal dashboard' },
      { href: '/app/ai/reports', label: 'AI reports' },
    ],
    eyebrowClassName: 'text-emerald-700 dark:text-emerald-300',
    hoverClassName: 'hover:border-emerald-300',
    actionClassName: 'text-emerald-700 dark:text-emerald-300',
    apiPreview: 'storage',
  },
  {
    slug: 'onedrive',
    key: 'ONEDRIVE',
    category: 'STORAGE',
    href: '/app/integrations/onedrive',
    label: 'OneDrive',
    badge: 'Storage',
    eyebrow: 'OneDrive',
    title: 'Map enterprise document delivery and archive to OneDrive and Microsoft 365',
    description:
      'OneDrive lane menyiapkan archive, signed access, dan M365 document exchange untuk tenant enterprise.',
    highlights: [
      'Enterprise document handoff',
      'Signed access readiness',
      'Archive and policy alignment',
      'M365-linked storage path',
    ],
    relatedLinks: [
      { href: '/app/settings', label: 'Settings' },
      { href: '/portal/dashboard', label: 'Portal dashboard' },
      { href: '/app/finance/financial-statements', label: 'Financial statements' },
    ],
    eyebrowClassName: 'text-emerald-700 dark:text-emerald-300',
    hoverClassName: 'hover:border-emerald-300',
    actionClassName: 'text-emerald-700 dark:text-emerald-300',
    apiPreview: 'storage',
  },
  {
    slug: 's3',
    key: 'S3',
    category: 'STORAGE',
    href: '/app/integrations/s3',
    label: 'S3',
    badge: 'Storage',
    eyebrow: 'S3',
    title: 'Use S3 as the primary archive, export sink, and resilience layer',
    description:
      'S3 lane memosisikan object storage sebagai backbone untuk archive, signed export, backup, dan file redundancy lintas workspace.',
    highlights: [
      'Object storage backbone',
      'Export and archive sink',
      'Signed URL delivery',
      'Backup redundancy control',
    ],
    relatedLinks: [
      { href: '/portal/dashboard', label: 'Portal dashboard' },
      { href: '/app/mobile/offline-sync', label: 'Offline sync' },
      { href: '/app/automation/webhooks', label: 'Automation webhooks' },
    ],
    eyebrowClassName: 'text-emerald-700 dark:text-emerald-300',
    hoverClassName: 'hover:border-emerald-300',
    actionClassName: 'text-emerald-700 dark:text-emerald-300',
    apiPreview: 'storage',
  },
  {
    slug: 'openai',
    key: 'OPENAI',
    category: 'AI',
    href: '/app/integrations/openai',
    label: 'OpenAI',
    badge: 'AI',
    eyebrow: 'OpenAI',
    title: 'Use OpenAI as a governed orchestration rail for NovaERP copilots',
    description:
      'OpenAI lane menyatukan Chat ERP, AI report, recommendation, dan domain copilot dengan guardrail dan routing yang terukur.',
    highlights: [
      'Chat ERP orchestration',
      'Report and recommendation lane',
      'Prompt governance starter',
      'Cross-domain model routing',
    ],
    relatedLinks: [
      { href: '/app/ai/chat-erp', label: 'Chat ERP' },
      { href: '/app/ai/reports', label: 'AI reports' },
      { href: '/app/ai/analytics', label: 'AI analytics' },
    ],
    eyebrowClassName: 'text-rose-700 dark:text-rose-300',
    hoverClassName: 'hover:border-rose-300',
    actionClassName: 'text-rose-700 dark:text-rose-300',
    apiPreview: 'ai',
  },
  {
    slug: 'claude',
    key: 'CLAUDE',
    category: 'AI',
    href: '/app/integrations/claude',
    label: 'Claude',
    badge: 'AI',
    eyebrow: 'Claude',
    title: 'Add a long-context reasoning provider for document-heavy ERP tasks',
    description:
      'Claude lane memfokuskan reasoning panjang, analisis dokumen, dan fallback model untuk workflow yang butuh konteks lebar.',
    highlights: [
      'Long-context reasoning',
      'Document-heavy analysis lane',
      'Fallback model readiness',
      'Governed prompt routing',
    ],
    relatedLinks: [
      { href: '/app/ai/reports', label: 'AI reports' },
      { href: '/app/ai/accounting', label: 'AI accounting' },
      { href: '/app/ai/procurement', label: 'AI procurement' },
    ],
    eyebrowClassName: 'text-rose-700 dark:text-rose-300',
    hoverClassName: 'hover:border-rose-300',
    actionClassName: 'text-rose-700 dark:text-rose-300',
    apiPreview: 'ai',
  },
  {
    slug: 'gemini',
    key: 'GEMINI',
    category: 'AI',
    href: '/app/integrations/gemini',
    label: 'Gemini',
    badge: 'AI',
    eyebrow: 'Gemini',
    title: 'Prepare multimodal and search-adjacent reasoning support through Gemini',
    description:
      'Gemini lane menyiapkan multimodal reasoning, search-adjacent workflow, dan provider redundancy untuk AI workspace.',
    highlights: [
      'Multimodal support lane',
      'Search-adjacent reasoning',
      'Provider redundancy planning',
      'Cost and guardrail visibility',
    ],
    relatedLinks: [
      { href: '/app/ai/natural-language-search', label: 'Natural-language search' },
      { href: '/app/ai/forecast', label: 'AI forecast' },
      { href: '/app/ai/recommendations', label: 'AI recommendations' },
    ],
    eyebrowClassName: 'text-rose-700 dark:text-rose-300',
    hoverClassName: 'hover:border-rose-300',
    actionClassName: 'text-rose-700 dark:text-rose-300',
    apiPreview: 'ai',
  },
];

export function getIntegrationProviderItem(slug: string) {
  return integrationProviderCatalog.find((provider) => provider.slug === slug);
}
