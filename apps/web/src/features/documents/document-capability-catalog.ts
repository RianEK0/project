import type { DocumentWorkspaceArea, DocumentWorkspaceCapabilityKey } from '@nova/shared-types';

export type DocumentCapabilitySlug =
  | 'pdf'
  | 'word'
  | 'excel'
  | 'contract'
  | 'invoice'
  | 'company-sop'
  | 'manual'
  | 'training'
  | 'policy';

export type DocumentCapabilityItem = {
  slug: DocumentCapabilitySlug;
  key: DocumentWorkspaceCapabilityKey;
  area: DocumentWorkspaceArea;
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
  apiPreview: 'formats' | 'records' | 'governance';
};

export type DocumentAreaCard = {
  id: string;
  label: string;
  badge: string;
  summary: string;
  className: string;
};

export const documentAreaCards: DocumentAreaCard[] = [
  {
    id: 'file-formats',
    label: 'File Formats',
    badge: '3 lanes',
    summary:
      'PDF, Word, dan Excel menjadi lane format terkontrol untuk distribusi, draft, dan spreadsheet operasional.',
    className: 'border-sky-200/80 bg-sky-50/70 dark:border-sky-900/60 dark:bg-sky-950/20',
  },
  {
    id: 'business-records',
    label: 'Business Records',
    badge: '2 lanes',
    summary:
      'Contract dan invoice digabungkan sebagai record lane yang dekat dengan procurement, finance, dan komersial.',
    className:
      'border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/20',
  },
  {
    id: 'governance-knowledge',
    label: 'Governance & Knowledge',
    badge: '4 lanes',
    summary:
      'Company SOP, manual, training, dan policy menjadi permukaan knowledge yang lebih governed dan reusable.',
    className: 'border-amber-200/80 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20',
  },
];

export const documentCapabilityCatalog: DocumentCapabilityItem[] = [
  {
    slug: 'pdf',
    key: 'PDF_LIBRARY',
    area: 'FILE_FORMATS',
    href: '/app/documents/pdf',
    label: 'PDF',
    badge: 'File Formats',
    eyebrow: 'PDF Library',
    title: 'Distribute stable governed PDFs for review, evidence, and cross-team sharing',
    description:
      'PDF lane memusatkan dokumen final seperti invoice, SOP, bukti, dan export terkontrol agar akses lintas tim tetap stabil.',
    highlights: [
      'Stable governed review format',
      'Evidence-friendly attachments',
      'Cross-team document sharing',
      'Searchable finalized records',
    ],
    relatedLinks: [
      { href: '/app/ai/document-ocr', label: 'AI document OCR' },
      { href: '/app/invoices', label: 'Invoices' },
      { href: '/portal/downloads', label: 'Portal downloads' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
    apiPreview: 'formats',
  },
  {
    slug: 'word',
    key: 'WORD_LIBRARY',
    area: 'FILE_FORMATS',
    href: '/app/documents/word',
    label: 'Word',
    badge: 'File Formats',
    eyebrow: 'Word Library',
    title:
      'Keep editable drafts controlled while policies, manuals, and contracts are still evolving',
    description:
      'Word lane membantu mengelola dokumen yang masih butuh revisi seperti kebijakan, manual, dan draft kontrak sebelum dipublikasikan.',
    highlights: [
      'Editable draft management',
      'Tracked-change oriented review',
      'Controlled publication handoff',
      'Policy and contract drafting support',
    ],
    relatedLinks: [
      { href: '/app/procurement/contracts', label: 'Procurement contracts' },
      { href: '/app/hr/training', label: 'HR training' },
      { href: '/app/platform/compliance', label: 'Compliance' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
    apiPreview: 'formats',
  },
  {
    slug: 'excel',
    key: 'EXCEL_LIBRARY',
    area: 'FILE_FORMATS',
    href: '/app/documents/excel',
    label: 'Excel',
    badge: 'File Formats',
    eyebrow: 'Excel Library',
    title: 'Govern spreadsheet-heavy planning, pricing, and analysis packs without losing context',
    description:
      'Excel lane menjadi rumah untuk spreadsheet budgeting, vendor pricing, dan pack analisis yang masih sangat dominan di operasi enterprise.',
    highlights: [
      'Spreadsheet governance starter',
      'Planning and pricing packs',
      'Analysis workbook continuity',
      'Controlled export references',
    ],
    relatedLinks: [
      { href: '/app/analytics/fact-table', label: 'Fact table' },
      { href: '/app/procurement/vendors/price-history', label: 'Vendor price history' },
      { href: '/app/finance/budgets', label: 'Budgets' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
    apiPreview: 'formats',
  },
  {
    slug: 'contract',
    key: 'CONTRACT_LIBRARY',
    area: 'BUSINESS_RECORDS',
    href: '/app/documents/contract',
    label: 'Contract',
    badge: 'Business Records',
    eyebrow: 'Contract Library',
    title: 'Track governed contract records close to procurement and commercial execution',
    description:
      'Contract lane menyatukan record kontrak agar draft, approval, dan referensi kewajiban tidak tercecer di banyak workspace.',
    highlights: [
      'Governed contract repository',
      'Approval-linked record review',
      'Obligation and expiry visibility',
      'Procurement and commercial references',
    ],
    relatedLinks: [
      { href: '/app/procurement/contracts', label: 'Procurement contracts' },
      { href: '/app/ai/contract-analysis', label: 'AI contract analysis' },
      { href: '/app/procurement/blanket-orders', label: 'Blanket orders' },
    ],
    eyebrowClassName: 'text-emerald-700 dark:text-emerald-300',
    hoverClassName: 'hover:border-emerald-300',
    actionClassName: 'text-emerald-700 dark:text-emerald-300',
    apiPreview: 'records',
  },
  {
    slug: 'invoice',
    key: 'INVOICE_LIBRARY',
    area: 'BUSINESS_RECORDS',
    href: '/app/documents/invoice',
    label: 'Invoice',
    badge: 'Business Records',
    eyebrow: 'Invoice Library',
    title: 'Unify invoice evidence, issued documents, and payable preparation in one lane',
    description:
      'Invoice lane menghubungkan invoice customer, invoice preparation procurement, dan bukti dokumen agar review keuangan lebih rapi.',
    highlights: [
      'Issued invoice visibility',
      'Payable preparation context',
      'Evidence bundling starter',
      'Cross-finance review support',
    ],
    relatedLinks: [
      { href: '/app/invoices', label: 'Invoices' },
      { href: '/app/sales/invoices', label: 'Sales invoices' },
      { href: '/app/procurement/invoice-preparation', label: 'Invoice preparation' },
    ],
    eyebrowClassName: 'text-emerald-700 dark:text-emerald-300',
    hoverClassName: 'hover:border-emerald-300',
    actionClassName: 'text-emerald-700 dark:text-emerald-300',
    apiPreview: 'records',
  },
  {
    slug: 'company-sop',
    key: 'COMPANY_SOP',
    area: 'GOVERNANCE_KNOWLEDGE',
    href: '/app/documents/company-sop',
    label: 'Company SOP',
    badge: 'Governance & Knowledge',
    eyebrow: 'Company SOP',
    title: 'Publish standard operating procedures with clearer ownership and rollout control',
    description:
      'Company SOP lane memusatkan prosedur kerja standar yang perlu stabil, bisa diaudit, dan mudah dirujuk lintas fungsi.',
    highlights: [
      'Governed SOP publishing',
      'Ownership and rollout clarity',
      'Audit-friendly procedure references',
      'Cross-branch operating consistency',
    ],
    relatedLinks: [
      { href: '/app/platform/compliance', label: 'Compliance' },
      { href: '/app/warehouse-operations/dashboard', label: 'Warehouse control tower' },
      { href: '/app/automation/approval-flows', label: 'Approval flows' },
    ],
    eyebrowClassName: 'text-amber-700 dark:text-amber-300',
    hoverClassName: 'hover:border-amber-300',
    actionClassName: 'text-amber-700 dark:text-amber-300',
    apiPreview: 'governance',
  },
  {
    slug: 'manual',
    key: 'MANUAL_LIBRARY',
    area: 'GOVERNANCE_KNOWLEDGE',
    href: '/app/documents/manual',
    label: 'Manual',
    badge: 'Governance & Knowledge',
    eyebrow: 'Manual Library',
    title: 'Organize operational manuals so teams can find the right guide without friction',
    description:
      'Manual lane menyusun panduan operasional, teknis, dan maintenance supaya operator tidak kehilangan referensi saat eksekusi.',
    highlights: [
      'Operational guide centralization',
      'Maintenance and equipment reference',
      'Role-specific knowledge packs',
      'Fast access for frontline teams',
    ],
    relatedLinks: [
      { href: '/app/warehouse-operations/scan', label: 'Warehouse scan' },
      { href: '/app/manufacturing/maintenance', label: 'Maintenance' },
      { href: '/app/mobile/offline-sync', label: 'Offline sync' },
    ],
    eyebrowClassName: 'text-amber-700 dark:text-amber-300',
    hoverClassName: 'hover:border-amber-300',
    actionClassName: 'text-amber-700 dark:text-amber-300',
    apiPreview: 'governance',
  },
  {
    slug: 'training',
    key: 'TRAINING_LIBRARY',
    area: 'GOVERNANCE_KNOWLEDGE',
    href: '/app/documents/training',
    label: 'Training',
    badge: 'Governance & Knowledge',
    eyebrow: 'Training Library',
    title: 'Keep onboarding and recurring training materials aligned with how teams actually work',
    description:
      'Training lane merapikan materi onboarding dan refresh training agar tidak terpisah dari role, KPI, dan pengembangan karyawan.',
    highlights: [
      'Onboarding material governance',
      'Recurring enablement support',
      'Role-linked knowledge packaging',
      'People development continuity',
    ],
    relatedLinks: [
      { href: '/app/hr/training', label: 'HR training' },
      { href: '/app/hr/performance', label: 'Performance' },
      { href: '/app/hr/kpis', label: 'KPIs' },
    ],
    eyebrowClassName: 'text-amber-700 dark:text-amber-300',
    hoverClassName: 'hover:border-amber-300',
    actionClassName: 'text-amber-700 dark:text-amber-300',
    apiPreview: 'governance',
  },
  {
    slug: 'policy',
    key: 'POLICY_LIBRARY',
    area: 'GOVERNANCE_KNOWLEDGE',
    href: '/app/documents/policy',
    label: 'Policy',
    badge: 'Governance & Knowledge',
    eyebrow: 'Policy Library',
    title: 'Control policy changes, review cycles, and enterprise references more deliberately',
    description:
      'Policy lane memusatkan kebijakan perusahaan agar review, perubahan, dan referensi compliance lebih tertata.',
    highlights: [
      'Policy review lifecycle',
      'Compliance-linked references',
      'Controlled change communication',
      'Enterprise trust posture support',
    ],
    relatedLinks: [
      { href: '/app/platform/compliance', label: 'Compliance' },
      { href: '/app/automation/rules', label: 'Automation rules' },
      { href: '/app/finance/financial-statements', label: 'Financial statements' },
    ],
    eyebrowClassName: 'text-amber-700 dark:text-amber-300',
    hoverClassName: 'hover:border-amber-300',
    actionClassName: 'text-amber-700 dark:text-amber-300',
    apiPreview: 'governance',
  },
];

export function getDocumentCapabilityItem(slug: string) {
  return documentCapabilityCatalog.find((capability) => capability.slug === slug);
}
