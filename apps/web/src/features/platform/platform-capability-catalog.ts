import type { PlatformCapabilityKey, PlatformWorkspaceArea } from '@nova/shared-types';

export type PlatformCapabilitySlug =
  | 'multi-company'
  | 'multi-branch'
  | 'multi-warehouse'
  | 'multi-currency'
  | 'multi-language'
  | 'timezone'
  | 'white-label'
  | 'theme-builder'
  | 'marketplace'
  | 'plugin-system'
  | 'extension-sdk'
  | 'audit-center'
  | 'compliance'
  | 'sso'
  | 'oauth'
  | 'saml';

export type PlatformCapabilityItem = {
  slug: PlatformCapabilitySlug;
  key: PlatformCapabilityKey;
  area: PlatformWorkspaceArea;
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
  apiPreview: 'topology' | 'experience' | 'identity';
};

export type PlatformAreaCard = {
  id: string;
  label: string;
  badge: string;
  summary: string;
  className: string;
};

export const platformAreaCards: PlatformAreaCard[] = [
  {
    id: 'topology',
    label: 'Topology',
    badge: '6 controls',
    summary:
      'Multi company, branch, warehouse, currency, language, dan timezone dijaga sebagai fondasi shape tenant enterprise.',
    className: 'border-sky-200/80 bg-sky-50/70 dark:border-sky-900/60 dark:bg-sky-950/20',
  },
  {
    id: 'experience',
    label: 'Experience',
    badge: '5 controls',
    summary:
      'White label, theme builder, marketplace, plugin system, dan extension SDK disatukan sebagai lane kustomisasi yang tetap tergovern.',
    className: 'border-amber-200/80 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20',
  },
  {
    id: 'identity-trust',
    label: 'Identity & Trust',
    badge: '5 controls',
    summary:
      'Audit center, compliance, SSO, OAuth, dan SAML menjadi control plane untuk enterprise trust posture.',
    className:
      'border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/20',
  },
];

export const platformCapabilityCatalog: PlatformCapabilityItem[] = [
  {
    slug: 'multi-company',
    key: 'MULTI_COMPANY',
    area: 'TOPOLOGY',
    href: '/app/platform/multi-company',
    label: 'Multi Company',
    badge: 'Topology',
    eyebrow: 'Multi Company',
    title: 'Support multiple legal entities without fragmenting the operating shell',
    description:
      'Lane ini memusatkan legal-entity isolation, default policy, dan reporting scope sebagai fondasi enterprise multi-company.',
    highlights: [
      'Entity isolation policy',
      'Cross-company reporting scope',
      'Shared service model starter',
      'Tenant-wide governance alignment',
    ],
    relatedLinks: [
      { href: '/app/platform/global-enterprise', label: 'Global enterprise workbench' },
      { href: '/app/organization', label: 'Organization' },
      { href: '/app/workspaces', label: 'Workspaces' },
      { href: '/app/finance/chart-of-accounts', label: 'Chart of accounts' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
    apiPreview: 'topology',
  },
  {
    slug: 'multi-branch',
    key: 'MULTI_BRANCH',
    area: 'TOPOLOGY',
    href: '/app/platform/multi-branch',
    label: 'Multi Branch',
    badge: 'Topology',
    eyebrow: 'Multi Branch',
    title: 'Operate branches with local defaults while keeping tenant control centralized',
    description:
      'Branch lane menyiapkan operating default, visibility, dan policy inheritance untuk ekspansi cabang.',
    highlights: [
      'Branch-level defaults',
      'Visibility and routing scope',
      'Operational policy inheritance',
      'Branch rollout starter',
    ],
    relatedLinks: [
      { href: '/app/platform/global-enterprise', label: 'Global enterprise workbench' },
      { href: '/app/organization', label: 'Organization' },
      { href: '/app/warehouses', label: 'Warehouses' },
      { href: '/app/calendar', label: 'Calendar' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
    apiPreview: 'topology',
  },
  {
    slug: 'multi-warehouse',
    key: 'MULTI_WAREHOUSE',
    area: 'TOPOLOGY',
    href: '/app/platform/multi-warehouse',
    label: 'Multi Warehouse',
    badge: 'Topology',
    eyebrow: 'Multi Warehouse',
    title: 'Keep warehouse expansion aligned with tenant topology and policy defaults',
    description:
      'Multi warehouse lane menghubungkan warehouse network ke governance tenant, branch, dan operating model.',
    highlights: [
      'Warehouse network visibility',
      'Branch and company alignment',
      'Default provisioning starter',
      'Cross-warehouse control plane',
    ],
    relatedLinks: [
      { href: '/app/platform/global-enterprise', label: 'Global enterprise workbench' },
      { href: '/app/warehouses', label: 'Warehouses' },
      { href: '/app/inventory', label: 'Inventory' },
      { href: '/app/warehouse-operations', label: 'Warehouse operations' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
    apiPreview: 'topology',
  },
  {
    slug: 'multi-currency',
    key: 'MULTI_CURRENCY',
    area: 'TOPOLOGY',
    href: '/app/platform/multi-currency',
    label: 'Multi Currency',
    badge: 'Topology',
    eyebrow: 'Multi Currency',
    title: 'Prepare finance and commercial flows for tenants operating across currencies',
    description:
      'Multi currency lane menghubungkan tenant locale dengan pricing, finance, dan settlement foundation.',
    highlights: [
      'Currency default model',
      'Commercial and finance alignment',
      'Exchange-rate dependency map',
      'Global tenant readiness',
    ],
    relatedLinks: [
      { href: '/app/finance/currencies', label: 'Currencies' },
      { href: '/app/finance/exchange-rates', label: 'Exchange rates' },
      { href: '/app/sales/price-lists', label: 'Price lists' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
    apiPreview: 'topology',
  },
  {
    slug: 'multi-language',
    key: 'MULTI_LANGUAGE',
    area: 'TOPOLOGY',
    href: '/app/platform/multi-language',
    label: 'Multi Language',
    badge: 'Topology',
    eyebrow: 'Multi Language',
    title: 'Lay the groundwork for multilingual shells and tenant-facing surfaces',
    description:
      'Multi language lane memfokuskan dictionary, fallback, dan translation coverage untuk tenant global.',
    highlights: [
      'Dictionary and fallback policy',
      'Shell translation readiness',
      'Portal language starter',
      'Operational text coverage',
    ],
    relatedLinks: [
      { href: '/app/settings', label: 'Settings' },
      { href: '/portal/dashboard', label: 'Portal dashboard' },
      { href: '/app/mobile/pwa', label: 'Mobile PWA' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
    apiPreview: 'topology',
  },
  {
    slug: 'timezone',
    key: 'TIMEZONE',
    area: 'TOPOLOGY',
    href: '/app/platform/timezone',
    label: 'Timezone',
    badge: 'Topology',
    eyebrow: 'Timezone',
    title: 'Keep scheduling, reporting, and audit time coherent across tenant regions',
    description:
      'Timezone lane memastikan default waktu tenant konsisten dari booking sampai automation dan audit trail.',
    highlights: [
      'Tenant timezone default',
      'Schedule and report alignment',
      'Audit timestamp consistency',
      'Automation timing starter',
    ],
    relatedLinks: [
      { href: '/app/calendar', label: 'Calendar' },
      { href: '/app/automation/cron', label: 'Automation cron' },
      { href: '/app/audit-logs', label: 'Audit logs' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
    apiPreview: 'topology',
  },
  {
    slug: 'white-label',
    key: 'WHITE_LABEL',
    area: 'EXPERIENCE',
    href: '/app/platform/white-label',
    label: 'White Label',
    badge: 'Experience',
    eyebrow: 'White Label',
    title: 'Give enterprise tenants their own brand shell without forking NovaERP',
    description:
      'White label lane menyiapkan branding tenant, domain feel, dan naming override yang tetap terkontrol.',
    highlights: [
      'Tenant brand identity',
      'Naming and shell override',
      'Safe customization lane',
      'Partner delivery starter',
    ],
    relatedLinks: [
      { href: '/app/settings', label: 'Settings' },
      { href: '/portal/dashboard', label: 'Portal dashboard' },
      { href: '/app/mobile/dark-mode', label: 'Dark mode' },
    ],
    eyebrowClassName: 'text-amber-700 dark:text-amber-300',
    hoverClassName: 'hover:border-amber-300',
    actionClassName: 'text-amber-700 dark:text-amber-300',
    apiPreview: 'experience',
  },
  {
    slug: 'theme-builder',
    key: 'THEME_BUILDER',
    area: 'EXPERIENCE',
    href: '/app/platform/theme-builder',
    label: 'Theme Builder',
    badge: 'Experience',
    eyebrow: 'Theme Builder',
    title: 'Control visual tokens and tenant-specific themes from one governed surface',
    description:
      'Theme builder lane memusatkan visual token, preview, dan rollout policy untuk kustomisasi tenant.',
    highlights: [
      'Visual token control',
      'Tenant theme presets',
      'Preview and rollout policy',
      'Shell consistency starter',
    ],
    relatedLinks: [
      { href: '/app/mobile/dark-mode', label: 'Dark mode' },
      { href: '/app/settings', label: 'Settings' },
      { href: '/app/dashboards', label: 'Dashboards' },
    ],
    eyebrowClassName: 'text-amber-700 dark:text-amber-300',
    hoverClassName: 'hover:border-amber-300',
    actionClassName: 'text-amber-700 dark:text-amber-300',
    apiPreview: 'experience',
  },
  {
    slug: 'marketplace',
    key: 'MARKETPLACE',
    area: 'EXPERIENCE',
    href: '/app/platform/marketplace',
    label: 'Marketplace',
    badge: 'Experience',
    eyebrow: 'Marketplace',
    title: 'Prepare an add-on catalog that is curated instead of chaotic',
    description:
      'Marketplace lane menyiapkan discovery surface untuk app, connector, dan extension yang sudah lolos governance.',
    highlights: [
      'Approved app catalog',
      'Discovery and install lane',
      'Pricing and review starter',
      'Tenant-safe ecosystem entry',
    ],
    relatedLinks: [
      { href: '/app/platform/plugin-marketplace', label: 'Plugin marketplace workbench' },
      { href: '/app/integrations', label: 'Integrations' },
      { href: '/app/platform/plugin-system', label: 'Plugin system' },
      { href: '/app/platform/extension-sdk', label: 'Extension SDK' },
    ],
    eyebrowClassName: 'text-amber-700 dark:text-amber-300',
    hoverClassName: 'hover:border-amber-300',
    actionClassName: 'text-amber-700 dark:text-amber-300',
    apiPreview: 'experience',
  },
  {
    slug: 'plugin-system',
    key: 'PLUGIN_SYSTEM',
    area: 'EXPERIENCE',
    href: '/app/platform/plugin-system',
    label: 'Plugin System',
    badge: 'Experience',
    eyebrow: 'Plugin System',
    title: 'Govern how external extensions add capability into NovaERP',
    description:
      'Plugin system lane memfokuskan manifest, permission, dan sandbox untuk extension yang ingin ikut bermain di platform.',
    highlights: [
      'Plugin manifest governance',
      'Permission and sandbox model',
      'Extension lifecycle starter',
      'Safe capability injection',
    ],
    relatedLinks: [
      { href: '/app/platform/plugin-marketplace', label: 'Plugin marketplace workbench' },
      { href: '/app/integrations', label: 'Integrations' },
      { href: '/app/platform/marketplace', label: 'Marketplace' },
      { href: '/app/platform/extension-sdk', label: 'Extension SDK' },
    ],
    eyebrowClassName: 'text-amber-700 dark:text-amber-300',
    hoverClassName: 'hover:border-amber-300',
    actionClassName: 'text-amber-700 dark:text-amber-300',
    apiPreview: 'experience',
  },
  {
    slug: 'extension-sdk',
    key: 'EXTENSION_SDK',
    area: 'EXPERIENCE',
    href: '/app/platform/extension-sdk',
    label: 'Extension SDK',
    badge: 'Experience',
    eyebrow: 'Extension SDK',
    title: 'Give partners a guided SDK for building approved extensions',
    description:
      'Extension SDK lane menyiapkan packaging, review, dan integration contract untuk partner atau tim internal.',
    highlights: [
      'SDK packaging contract',
      'Review and signing flow',
      'Developer guidance starter',
      'Marketplace handoff',
    ],
    relatedLinks: [
      { href: '/app/platform/public-api', label: 'Public API workbench' },
      { href: '/app/platform/plugin-system', label: 'Plugin system' },
      { href: '/app/platform/marketplace', label: 'Marketplace' },
      { href: '/app/integrations', label: 'Integrations' },
    ],
    eyebrowClassName: 'text-amber-700 dark:text-amber-300',
    hoverClassName: 'hover:border-amber-300',
    actionClassName: 'text-amber-700 dark:text-amber-300',
    apiPreview: 'experience',
  },
  {
    slug: 'audit-center',
    key: 'AUDIT_CENTER',
    area: 'IDENTITY_TRUST',
    href: '/app/platform/audit-center',
    label: 'Audit Center',
    badge: 'Identity & Trust',
    eyebrow: 'Audit Center',
    title: 'Turn raw audit logs into a dedicated trust and review surface',
    description:
      'Audit center lane memfokuskan retention, export, dan review untuk perubahan sensitif di seluruh platform.',
    highlights: [
      'Centralized trust review',
      'Retention and export posture',
      'Sensitive action visibility',
      'Compliance evidence starter',
    ],
    relatedLinks: [
      { href: '/app/audit-logs', label: 'Audit logs' },
      { href: '/app/roles', label: 'Roles' },
      { href: '/app/platform/compliance', label: 'Compliance' },
    ],
    eyebrowClassName: 'text-emerald-700 dark:text-emerald-300',
    hoverClassName: 'hover:border-emerald-300',
    actionClassName: 'text-emerald-700 dark:text-emerald-300',
    apiPreview: 'identity',
  },
  {
    slug: 'compliance',
    key: 'COMPLIANCE',
    area: 'IDENTITY_TRUST',
    href: '/app/platform/compliance',
    label: 'Compliance',
    badge: 'Identity & Trust',
    eyebrow: 'Compliance',
    title: 'Track enterprise policy posture without waiting for full certification scope',
    description:
      'Compliance lane menyiapkan control mapping, evidence direction, dan enterprise trust posture starter.',
    highlights: [
      'Control mapping starter',
      'Evidence direction lane',
      'Risk and posture visibility',
      'Policy-linked admin review',
    ],
    relatedLinks: [
      { href: '/app/platform/audit-center', label: 'Audit center' },
      { href: '/app/integrations', label: 'Integrations' },
      { href: '/app/automation/approval-flows', label: 'Approval flows' },
    ],
    eyebrowClassName: 'text-emerald-700 dark:text-emerald-300',
    hoverClassName: 'hover:border-emerald-300',
    actionClassName: 'text-emerald-700 dark:text-emerald-300',
    apiPreview: 'identity',
  },
  {
    slug: 'sso',
    key: 'SSO',
    area: 'IDENTITY_TRUST',
    href: '/app/platform/sso',
    label: 'SSO',
    badge: 'Identity & Trust',
    eyebrow: 'SSO',
    title: 'Prepare federated workforce login for enterprise tenants',
    description:
      'SSO lane menjadi pintu masuk untuk federated workforce access yang tetap aman dan bisa diaudit.',
    highlights: [
      'Federated login starter',
      'Tenant onboarding checklist',
      'Fallback access policy',
      'Trust posture linkage',
    ],
    relatedLinks: [
      { href: '/app/roles', label: 'Roles' },
      { href: '/app/integrations/google', label: 'Google integration' },
      { href: '/app/integrations/microsoft', label: 'Microsoft integration' },
    ],
    eyebrowClassName: 'text-emerald-700 dark:text-emerald-300',
    hoverClassName: 'hover:border-emerald-300',
    actionClassName: 'text-emerald-700 dark:text-emerald-300',
    apiPreview: 'identity',
  },
  {
    slug: 'oauth',
    key: 'OAUTH',
    area: 'IDENTITY_TRUST',
    href: '/app/platform/oauth',
    label: 'OAuth',
    badge: 'Identity & Trust',
    eyebrow: 'OAuth',
    title: 'Support delegated auth for suites, plugins, and partner ecosystems',
    description:
      'OAuth lane menghubungkan delegated access ke integrations, plugin system, dan tenant governance.',
    highlights: [
      'Delegated auth flow',
      'Consent visibility',
      'Token lifecycle starter',
      'Ecosystem and plugin linkage',
    ],
    relatedLinks: [
      { href: '/app/platform/public-api', label: 'Public API workbench' },
      { href: '/app/integrations', label: 'Integrations' },
      { href: '/app/platform/plugin-system', label: 'Plugin system' },
      { href: '/app/platform/sso', label: 'SSO' },
    ],
    eyebrowClassName: 'text-emerald-700 dark:text-emerald-300',
    hoverClassName: 'hover:border-emerald-300',
    actionClassName: 'text-emerald-700 dark:text-emerald-300',
    apiPreview: 'identity',
  },
  {
    slug: 'saml',
    key: 'SAML',
    area: 'IDENTITY_TRUST',
    href: '/app/platform/saml',
    label: 'SAML',
    badge: 'Identity & Trust',
    eyebrow: 'SAML',
    title: 'Lay the groundwork for enterprise identity providers that depend on SAML',
    description:
      'SAML lane memfokuskan metadata exchange, certificate lifecycle, dan enterprise federation readiness.',
    highlights: [
      'Metadata exchange starter',
      'Certificate rotation readiness',
      'Enterprise IdP support lane',
      'Fallback guidance for rollout',
    ],
    relatedLinks: [
      { href: '/app/platform/sso', label: 'SSO' },
      { href: '/app/integrations/microsoft', label: 'Microsoft integration' },
      { href: '/app/platform/compliance', label: 'Compliance' },
    ],
    eyebrowClassName: 'text-emerald-700 dark:text-emerald-300',
    hoverClassName: 'hover:border-emerald-300',
    actionClassName: 'text-emerald-700 dark:text-emerald-300',
    apiPreview: 'identity',
  },
];

export function getPlatformCapabilityItem(slug: string) {
  return platformCapabilityCatalog.find((capability) => capability.slug === slug);
}
