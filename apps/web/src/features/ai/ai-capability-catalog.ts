import type { AiWorkspaceArea, AiWorkspaceCapabilityKey } from '@nova/shared-types';

export type AiCapabilitySlug =
  | 'copilot'
  | 'dashboard'
  | 'chat'
  | 'predictive-analytics'
  | 'demand-forecasting'
  | 'fraud-detection'
  | 'cash-flow-prediction'
  | 'inventory-optimization'
  | 'procurement-optimization'
  | 'sales-recommendation'
  | 'warehouse-optimization'
  | 'document-ocr'
  | 'invoice-extraction'
  | 'receipt-extraction'
  | 'contract-analysis'
  | 'vision'
  | 'voice-assistant'
  | 'meeting-summary';

export type AiCapabilityItem = {
  slug: AiCapabilitySlug;
  key: AiWorkspaceCapabilityKey;
  area: AiWorkspaceArea;
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
  apiPreview:
    | 'command-center'
    | 'forecast-risk'
    | 'optimization'
    | 'document-intelligence'
    | 'perception'
    | 'assistants';
};

export type AiAreaCard = {
  id: string;
  label: string;
  badge: string;
  summary: string;
  className: string;
};

export type AiFoundationRouteCard = {
  href: string;
  label: string;
  description: string;
  badge: string;
};

export const aiAreaCards: AiAreaCard[] = [
  {
    id: 'command-center',
    label: 'Command Center',
    badge: '4 lanes',
    summary:
      'AI Copilot, AI dashboard, AI chat, dan predictive analytics menjadi entry point utama untuk membaca, menjawab, dan mengarahkan insight lintas domain.',
    className: 'border-sky-200/80 bg-sky-50/70 dark:border-sky-900/60 dark:bg-sky-950/20',
  },
  {
    id: 'forecast-risk',
    label: 'Forecast & Risk',
    badge: '3 lanes',
    summary:
      'Demand forecasting, fraud detection, dan cash-flow prediction menyiapkan sinyal maju untuk operasi dan finance.',
    className:
      'border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/20',
  },
  {
    id: 'optimization',
    label: 'Optimization',
    badge: '4 lanes',
    summary:
      'Inventory, procurement, sales, dan warehouse optimization menghubungkan rekomendasi AI langsung ke route eksekusi.',
    className: 'border-amber-200/80 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20',
  },
  {
    id: 'document-intelligence',
    label: 'Document Intelligence',
    badge: '4 lanes',
    summary:
      'OCR, invoice extraction, receipt extraction, dan contract analysis membentuk jalur dokumen yang tetap governed.',
    className: 'border-rose-200/80 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/20',
  },
  {
    id: 'perception',
    label: 'Perception',
    badge: '1 lane',
    summary:
      'AI Vision membaca rak, area gudang, wajah absensi, dan kepatuhan PPE dari aliran kamera yang tetap bisa direview manusia.',
    className:
      'border-violet-200/80 bg-violet-50/70 dark:border-violet-900/60 dark:bg-violet-950/20',
  },
  {
    id: 'assistants',
    label: 'Assistants',
    badge: '2 lanes',
    summary:
      'Voice assistant dan meeting summary menyiapkan input percakapan dan follow-up capture untuk kerja sehari-hari.',
    className: 'border-slate-200/80 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/30',
  },
];

export const aiFoundationRouteCards: AiFoundationRouteCard[] = [
  {
    href: '/app/ai/copilot',
    label: 'AI Copilot',
    description:
      'Turn plain-language requests into safe queries, tables, charts, summaries, and export-ready output.',
    badge: 'Spotlight',
  },
  {
    href: '/app/ai/chat-erp',
    label: 'Chat ERP',
    description:
      'Route enterprise questions into the right NovaERP domain with intent and next-step preview.',
    badge: 'Copilot',
  },
  {
    href: '/app/ai/ask-inventory',
    label: 'Ask Inventory',
    description: 'Ask stock, warehouse, lot, serial, and replenishment questions in one lane.',
    badge: 'Inventory',
  },
  {
    href: '/app/ai/ask-finance',
    label: 'Ask Finance',
    description: 'Review treasury, budget, and finance signals through a guided assistant surface.',
    badge: 'Finance',
  },
  {
    href: '/app/ai/ask-crm',
    label: 'Ask CRM',
    description: 'Inspect pipeline, follow-up, and deal signals with CRM-focused AI prompts.',
    badge: 'CRM',
  },
  {
    href: '/app/ai/natural-language-search',
    label: 'Natural Language Search',
    description: 'Translate plain-language queries into domain-aware search plans and filters.',
    badge: 'Search',
  },
  {
    href: '/app/ai/reports',
    label: 'AI Report',
    description: 'Generate executive summaries, operational briefs, and exception digests.',
    badge: 'Report',
  },
  {
    href: '/app/ai/forecast',
    label: 'AI Forecast',
    description: 'Preview short-horizon trend projections for operational and financial signals.',
    badge: 'Forecast',
  },
  {
    href: '/app/ai/recommendations',
    label: 'AI Recommendation',
    description: 'Score and prioritize actions by impact, urgency, and confidence.',
    badge: 'Decision',
  },
  {
    href: '/app/ai/procurement',
    label: 'AI Procurement',
    description: 'Summarize sourcing risk, RFQ priorities, lead-time exposure, and vendor signals.',
    badge: 'Procurement',
  },
  {
    href: '/app/ai/sales',
    label: 'AI Sales',
    description: 'Read delivery, invoicing, and collection momentum through guided AI recaps.',
    badge: 'Sales',
  },
  {
    href: '/app/ai/accounting',
    label: 'AI Accounting',
    description: 'Surface journal anomalies, close blockers, and cash-flow narratives.',
    badge: 'Accounting',
  },
  {
    href: '/app/ai/hr',
    label: 'AI HR',
    description: 'Summarize attendance, payroll, recruitment, and people operations exceptions.',
    badge: 'HR',
  },
  {
    href: '/app/ai/manufacturing',
    label: 'AI Manufacturing',
    description: 'Digest MRP shortages, capacity bottlenecks, quality losses, and planning risks.',
    badge: 'Manufacturing',
  },
  {
    href: '/app/ai/analytics',
    label: 'AI Analytics',
    description: 'Package cross-domain trends, anomalies, and escalation-worthy signals.',
    badge: 'Analytics',
  },
  {
    href: '/app/ai/vision',
    label: 'AI Vision',
    description:
      'Scan racks, warehouse aisles, employee attendance, and PPE compliance from camera captures.',
    badge: 'Vision',
  },
  {
    href: '/app/ai/document-ocr',
    label: 'OCR Upload',
    description:
      'Upload invoice photos or PDFs and map supplier, tax, item, and pricing fields into database-ready review.',
    badge: 'OCR',
  },
  {
    href: '/app/ai/voice-assistant',
    label: 'AI Voice',
    description:
      'Turn spoken ERP commands into guided draft actions for procurement, inventory, and finance.',
    badge: 'Voice',
  },
  {
    href: '/app/ai/meeting-summary',
    label: 'AI Meeting',
    description:
      'Upload meeting audio and convert it into summary, decisions, action items, deadlines, and PIC owners.',
    badge: 'Meeting',
  },
  {
    href: '/app/ai/document-ai',
    label: 'Document AI',
    description:
      'Upload contracts, agreements, NDA, purchase orders, or invoices to read summary, deadlines, risks, amount, parties, and status.',
    badge: 'Review',
  },
];

export const aiCapabilityCatalog: AiCapabilityItem[] = [
  {
    slug: 'copilot',
    key: 'AI_COPILOT',
    area: 'COMMAND_CENTER',
    href: '/app/ai/copilot',
    label: 'AI Copilot',
    badge: 'Command Center',
    eyebrow: 'AI Copilot',
    title:
      'Answer business questions with safe queries, visual output, and draft actions that stay governed',
    description:
      'AI Copilot menjadi permukaan utama untuk pertanyaan seperti laporan penjualan, stok yang harus segera dipesan, atau brief arus kas, lalu menerjemahkannya menjadi query aman, tabel, grafik, ringkasan, dan next action.',
    highlights: [
      'Safe query execution plan',
      'Table, chart, and summary packaging',
      'Export-ready PDF and Excel suggestions',
      'Draft hand-off into procurement, sales, and finance routes',
    ],
    relatedLinks: [
      { href: '/app/ai/copilot', label: 'AI Copilot workbench' },
      { href: '/app/sales/analytics', label: 'Sales analytics' },
      { href: '/app/procurement/analytics', label: 'Procurement analytics' },
      { href: '/app/finance/cash-flow', label: 'Cash flow' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
    apiPreview: 'command-center',
  },
  {
    slug: 'dashboard',
    key: 'AI_DASHBOARD',
    area: 'COMMAND_CENTER',
    href: '/app/ai/dashboard',
    label: 'AI Dashboard',
    badge: 'Command Center',
    eyebrow: 'AI Dashboard',
    title: 'Use an AI-first overview to rank the signals that need attention across NovaERP',
    description:
      'AI Dashboard menyatukan briefing, anomalies, dan suggested next actions agar operator atau eksekutif tidak harus membuka banyak module sebelum memahami prioritas hari itu.',
    highlights: [
      'Cross-domain AI scorecards',
      'Priority-first exception review',
      'Executive and operator briefing packs',
      'Direct links into execution workspaces',
    ],
    relatedLinks: [
      { href: '/app/dashboards', label: 'Dashboards' },
      { href: '/app/ai/analytics', label: 'AI analytics' },
      { href: '/app/ai/chat-erp', label: 'Chat ERP' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
    apiPreview: 'command-center',
  },
  {
    slug: 'chat',
    key: 'AI_CHAT',
    area: 'COMMAND_CENTER',
    href: '/app/ai/chat',
    label: 'AI Chat',
    badge: 'Command Center',
    eyebrow: 'AI Chat',
    title: 'Create a conversational AI surface that carries context into the right business route',
    description:
      'AI Chat memperluas Chat ERP menjadi lane percakapan yang lebih eksplisit untuk routing, summarization, dan suggested action tanpa memecah konteks user.',
    highlights: [
      'Unified conversational entry point',
      'Context carry-over between domains',
      'Suggested next actions and routes',
      'Fallback into search and analytics',
    ],
    relatedLinks: [
      { href: '/app/ai/chat-erp', label: 'Chat ERP' },
      { href: '/app/ai/natural-language-search', label: 'Natural language search' },
      { href: '/app/integrations/openai', label: 'OpenAI integration' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
    apiPreview: 'command-center',
  },
  {
    slug: 'predictive-analytics',
    key: 'PREDICTIVE_ANALYTICS',
    area: 'COMMAND_CENTER',
    href: '/app/ai/predictive-analytics',
    label: 'Predictive Analytics',
    badge: 'Command Center',
    eyebrow: 'Predictive Analytics',
    title: 'Package forward-looking analytics that users can review before they act',
    description:
      'Predictive analytics lane memfokuskan trend projection, anomaly packaging, dan scenario narrative agar insight AI lebih mudah dipakai oleh bisnis.',
    highlights: [
      'Forward-looking trend packaging',
      'Scenario-driven narratives',
      'Signal prioritization for operators',
      'Cross-domain insight composition',
    ],
    relatedLinks: [
      { href: '/app/ai/analytics', label: 'AI analytics' },
      { href: '/app/analytics', label: 'Analytics' },
      { href: '/app/dashboards/executive', label: 'Executive dashboard' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
    apiPreview: 'command-center',
  },
  {
    slug: 'demand-forecasting',
    key: 'DEMAND_FORECASTING',
    area: 'FORECAST_RISK',
    href: '/app/ai/demand-forecasting',
    label: 'Demand Forecasting',
    badge: 'Forecast & Risk',
    eyebrow: 'Demand Forecasting',
    title: 'Project demand shifts earlier so purchasing and production can move sooner',
    description:
      'Demand forecasting lane menghubungkan histori penjualan, stok, dan planning signal untuk memproyeksikan kebutuhan lebih dini.',
    highlights: [
      'Demand projection by horizon',
      'Planning and replenishment alignment',
      'Service-level aware scenario review',
      'Actionable planning drill-downs',
    ],
    relatedLinks: [
      { href: '/app/ai/forecast', label: 'AI forecast' },
      { href: '/app/procurement/analytics', label: 'Procurement analytics' },
      { href: '/app/manufacturing/planning', label: 'Production planning' },
    ],
    eyebrowClassName: 'text-emerald-700 dark:text-emerald-300',
    hoverClassName: 'hover:border-emerald-300',
    actionClassName: 'text-emerald-700 dark:text-emerald-300',
    apiPreview: 'forecast-risk',
  },
  {
    slug: 'fraud-detection',
    key: 'FRAUD_DETECTION',
    area: 'FORECAST_RISK',
    href: '/app/ai/fraud-detection',
    label: 'Fraud Detection',
    badge: 'Forecast & Risk',
    eyebrow: 'Fraud Detection',
    title: 'Flag unusual behavior across approvals, payments, and exceptions before loss expands',
    description:
      'Fraud detection lane membantu finance dan admin membaca pola yang tidak biasa pada approval, payment, dan operational exception.',
    highlights: [
      'Suspicious pattern surfacing',
      'Exception triage support',
      'Finance and audit review handoff',
      'Investigative signal packaging',
    ],
    relatedLinks: [
      { href: '/app/audit-logs', label: 'Audit logs' },
      { href: '/app/finance', label: 'Finance workspace' },
      { href: '/app/ai/accounting', label: 'AI accounting' },
    ],
    eyebrowClassName: 'text-emerald-700 dark:text-emerald-300',
    hoverClassName: 'hover:border-emerald-300',
    actionClassName: 'text-emerald-700 dark:text-emerald-300',
    apiPreview: 'forecast-risk',
  },
  {
    slug: 'cash-flow-prediction',
    key: 'CASH_FLOW_PREDICTION',
    area: 'FORECAST_RISK',
    href: '/app/ai/cash-flow-prediction',
    label: 'Cash Flow Prediction',
    badge: 'Forecast & Risk',
    eyebrow: 'Cash Flow Prediction',
    title: 'Look ahead at liquidity pressure before finance issues become urgent',
    description:
      'Cash flow prediction lane membaca invoice, payment, dan operating signal untuk memberi gambaran tekanan likuiditas jangka dekat.',
    highlights: [
      'Liquidity outlook by horizon',
      'Receivable and payable scenario review',
      'Collection risk packaging',
      'Finance-ready narrative support',
    ],
    relatedLinks: [
      { href: '/app/finance/cash-flow', label: 'Cash flow' },
      { href: '/app/finance/financial-statements', label: 'Financial statements' },
      { href: '/app/ai/accounting', label: 'AI accounting' },
    ],
    eyebrowClassName: 'text-emerald-700 dark:text-emerald-300',
    hoverClassName: 'hover:border-emerald-300',
    actionClassName: 'text-emerald-700 dark:text-emerald-300',
    apiPreview: 'forecast-risk',
  },
  {
    slug: 'inventory-optimization',
    key: 'AI_INVENTORY_OPTIMIZATION',
    area: 'OPTIMIZATION',
    href: '/app/ai/inventory-optimization',
    label: 'AI Inventory Optimization',
    badge: 'Optimization',
    eyebrow: 'Inventory Optimization',
    title: 'Turn stock health signals into sharper replenishment and inventory decisions',
    description:
      'Inventory optimization lane membantu planner melihat excess, shortage, dan replenishment action yang paling layak didorong lebih dulu.',
    highlights: [
      'Replenishment prioritization',
      'Excess and shortage balancing',
      'Cross-warehouse stock guidance',
      'Execution-ready next actions',
    ],
    relatedLinks: [
      { href: '/app/inventory', label: 'Inventory' },
      { href: '/app/ai/ask-inventory', label: 'Ask inventory' },
      { href: '/app/warehouse-operations', label: 'Warehouse operations' },
    ],
    eyebrowClassName: 'text-amber-700 dark:text-amber-300',
    hoverClassName: 'hover:border-amber-300',
    actionClassName: 'text-amber-700 dark:text-amber-300',
    apiPreview: 'optimization',
  },
  {
    slug: 'procurement-optimization',
    key: 'AI_PROCUREMENT_OPTIMIZATION',
    area: 'OPTIMIZATION',
    href: '/app/ai/procurement-optimization',
    label: 'AI Procurement Optimization',
    badge: 'Optimization',
    eyebrow: 'Procurement Optimization',
    title: 'Guide sourcing and vendor decisions with risk, lead-time, and cost context together',
    description:
      'Procurement optimization lane menyatukan vendor risk, lead time, dan RFQ signal untuk membantu buyer memutuskan fokus pengadaan.',
    highlights: [
      'Sourcing scenario suggestions',
      'Vendor risk and lead-time blending',
      'Award decision support',
      'Direct follow-through into procurement routes',
    ],
    relatedLinks: [
      { href: '/app/procurement', label: 'Procurement' },
      { href: '/app/ai/procurement', label: 'AI procurement' },
      { href: '/app/procurement/analytics', label: 'Procurement analytics' },
    ],
    eyebrowClassName: 'text-amber-700 dark:text-amber-300',
    hoverClassName: 'hover:border-amber-300',
    actionClassName: 'text-amber-700 dark:text-amber-300',
    apiPreview: 'optimization',
  },
  {
    slug: 'sales-recommendation',
    key: 'AI_SALES_RECOMMENDATION',
    area: 'OPTIMIZATION',
    href: '/app/ai/sales-recommendation',
    label: 'AI Sales Recommendation',
    badge: 'Optimization',
    eyebrow: 'Sales Recommendation',
    title: 'Rank the most valuable commercial moves before momentum is lost',
    description:
      'Sales recommendation lane memberi ranking tindakan untuk pipeline, quotation, fulfillment, dan collection agar tim komersial bergerak lebih cepat.',
    highlights: [
      'Deal and collection prioritization',
      'Fulfillment risk-aware guidance',
      'Conversion and follow-up ranking',
      'Action routing into sales and CRM',
    ],
    relatedLinks: [
      { href: '/app/sales', label: 'Sales workspace' },
      { href: '/app/crm', label: 'CRM workspace' },
      { href: '/app/ai/sales', label: 'AI sales' },
    ],
    eyebrowClassName: 'text-amber-700 dark:text-amber-300',
    hoverClassName: 'hover:border-amber-300',
    actionClassName: 'text-amber-700 dark:text-amber-300',
    apiPreview: 'optimization',
  },
  {
    slug: 'warehouse-optimization',
    key: 'AI_WAREHOUSE_OPTIMIZATION',
    area: 'OPTIMIZATION',
    href: '/app/ai/warehouse-optimization',
    label: 'AI Warehouse Optimization',
    badge: 'Optimization',
    eyebrow: 'Warehouse Optimization',
    title: 'Translate throughput bottlenecks into smarter warehouse priorities and task choices',
    description:
      'Warehouse optimization lane memadukan congestion, task, dan movement signal untuk membantu operator dan supervisor mengatur fokus execution.',
    highlights: [
      'Task prioritization guidance',
      'Congestion-aware suggestions',
      'Slotting and wave support',
      'Direct handoff into execution routes',
    ],
    relatedLinks: [
      { href: '/app/warehouse-operations', label: 'Warehouse operations' },
      { href: '/app/warehouses', label: 'Warehouses' },
      { href: '/app/ai/ask-inventory', label: 'Ask inventory' },
    ],
    eyebrowClassName: 'text-amber-700 dark:text-amber-300',
    hoverClassName: 'hover:border-amber-300',
    actionClassName: 'text-amber-700 dark:text-amber-300',
    apiPreview: 'optimization',
  },
  {
    slug: 'document-ocr',
    key: 'AI_DOCUMENT_OCR',
    area: 'DOCUMENT_INTELLIGENCE',
    href: '/app/ai/document-ocr',
    label: 'AI Document OCR',
    badge: 'Document Intelligence',
    eyebrow: 'Document OCR',
    title: 'Make scanned documents readable and searchable before downstream extraction begins',
    description:
      'Document OCR lane menyiapkan upload foto invoice atau PDF agar AI bisa membaca supplier, tanggal, nomor, PPN, item, dan harga sebelum data diarahkan ke database review.',
    highlights: [
      'Searchable text generation',
      'Invoice field extraction starter',
      'Database-ready mapping preview',
      'Low-quality document fallback',
      'Better downstream extraction quality',
    ],
    relatedLinks: [
      { href: '/app/documents/invoice', label: 'Documents invoice' },
      { href: '/portal/downloads', label: 'Portal downloads' },
      { href: '/app/procurement/receipts', label: 'Procurement receipts' },
      { href: '/app/sales/invoices', label: 'Sales invoices' },
    ],
    eyebrowClassName: 'text-rose-700 dark:text-rose-300',
    hoverClassName: 'hover:border-rose-300',
    actionClassName: 'text-rose-700 dark:text-rose-300',
    apiPreview: 'document-intelligence',
  },
  {
    slug: 'invoice-extraction',
    key: 'AI_INVOICE_EXTRACTION',
    area: 'DOCUMENT_INTELLIGENCE',
    href: '/app/ai/invoice-extraction',
    label: 'AI Invoice Extraction',
    badge: 'Document Intelligence',
    eyebrow: 'Invoice Extraction',
    title: 'Capture invoice fields faster while keeping human review in the loop',
    description:
      'Invoice extraction lane mempercepat pembacaan vendor, amount, due date, dan tax signal untuk finance dan procurement review.',
    highlights: [
      'Vendor and amount capture',
      'Due date and tax extraction',
      'Confidence-based review routing',
      'Finance-ready document triage',
    ],
    relatedLinks: [
      { href: '/app/procurement/invoice-preparation', label: 'Invoice preparation' },
      { href: '/app/sales/invoices', label: 'Sales invoices' },
      { href: '/app/ai/accounting', label: 'AI accounting' },
    ],
    eyebrowClassName: 'text-rose-700 dark:text-rose-300',
    hoverClassName: 'hover:border-rose-300',
    actionClassName: 'text-rose-700 dark:text-rose-300',
    apiPreview: 'document-intelligence',
  },
  {
    slug: 'receipt-extraction',
    key: 'AI_RECEIPT_EXTRACTION',
    area: 'DOCUMENT_INTELLIGENCE',
    href: '/app/ai/receipt-extraction',
    label: 'AI Receipt Extraction',
    badge: 'Document Intelligence',
    eyebrow: 'Receipt Extraction',
    title: 'Speed up warehouse and procurement evidence capture from receipts and proof documents',
    description:
      'Receipt extraction lane memfokuskan pengambilan data dari goods receipt, expense receipt, dan bukti penerimaan agar review manual lebih singkat.',
    highlights: [
      'Receipt line capture',
      'Warehouse evidence digitization',
      'Low-confidence exception routing',
      'Procurement and receiving support',
    ],
    relatedLinks: [
      { href: '/app/procurement/receipts', label: 'Procurement receipts' },
      { href: '/app/warehouse-operations/receipts', label: 'Warehouse receipts' },
      { href: '/app/ai/procurement', label: 'AI procurement' },
    ],
    eyebrowClassName: 'text-rose-700 dark:text-rose-300',
    hoverClassName: 'hover:border-rose-300',
    actionClassName: 'text-rose-700 dark:text-rose-300',
    apiPreview: 'document-intelligence',
  },
  {
    slug: 'contract-analysis',
    key: 'AI_CONTRACT_ANALYSIS',
    area: 'DOCUMENT_INTELLIGENCE',
    href: '/app/ai/contract-analysis',
    label: 'Document AI',
    badge: 'Document Intelligence',
    eyebrow: 'Document AI',
    title:
      'Read contracts, agreements, NDA, purchase orders, and invoices into one structured review',
    description:
      'Document AI lane membantu tim membaca ringkasan, deadline, risiko, nominal, pihak, dan status dari berbagai dokumen penting sebelum mereka menindaklanjuti isinya.',
    highlights: [
      'Cross-document executive summary',
      'Deadline and status extraction',
      'Nominal and parties detection',
      'Risk-focused review support',
      'Renewal and negotiation prep',
    ],
    relatedLinks: [
      { href: '/app/ai/document-ai', label: 'Document AI workbench' },
      { href: '/app/procurement/contracts', label: 'Purchase contracts' },
      { href: '/app/documents/contract', label: 'Documents contract' },
      { href: '/app/ai/reports', label: 'AI reports' },
    ],
    eyebrowClassName: 'text-rose-700 dark:text-rose-300',
    hoverClassName: 'hover:border-rose-300',
    actionClassName: 'text-rose-700 dark:text-rose-300',
    apiPreview: 'document-intelligence',
  },
  {
    slug: 'vision',
    key: 'AI_VISION',
    area: 'PERCEPTION',
    href: '/app/ai/vision',
    label: 'AI Vision',
    badge: 'Perception',
    eyebrow: 'AI Vision',
    title:
      'Use camera input to recognize racks, stock, attendance, and PPE posture before operators post actions',
    description:
      'AI Vision lane menyiapkan scan rak, scan gudang, face attendance, dan PPE detection agar tim warehouse, HR, dan safety bisa bergerak lebih cepat dari satu tangkapan kamera.',
    highlights: [
      'Rack and warehouse stock recognition',
      'Location, barcode, QR, lot, and serial capture',
      'Face attendance matching with shift context',
      'Helmet, mask, shoes, and vest compliance checks',
      'Supervisor review for low-confidence scans',
    ],
    relatedLinks: [
      { href: '/app/warehouse-operations/dashboard', label: 'Warehouse dashboard' },
      { href: '/app/hr/attendance', label: 'HR attendance' },
      { href: '/app/mobile', label: 'Mobile workspace' },
      { href: '/app/automation/rule-engine', label: 'Rule engine' },
    ],
    eyebrowClassName: 'text-violet-700 dark:text-violet-300',
    hoverClassName: 'hover:border-violet-300 dark:hover:border-violet-700',
    actionClassName: 'text-violet-700 dark:text-violet-300',
    apiPreview: 'perception',
  },
  {
    slug: 'voice-assistant',
    key: 'AI_VOICE_ASSISTANT',
    area: 'ASSISTANTS',
    href: '/app/ai/voice-assistant',
    label: 'AI Voice Assistant',
    badge: 'Assistants',
    eyebrow: 'Voice Assistant',
    title: 'Support busy operators with voice-first AI queries and guided confirmations',
    description:
      'Voice assistant lane menyiapkan pengalaman tanya-jawab lisan yang cocok untuk mobile, warehouse, atau meja kerja yang sedang sibuk.',
    highlights: [
      'Voice-led query support',
      'Guided command confirmation',
      'Mobile and warehouse fit',
      'Hands-busy interaction starter',
      'Draft creation for spoken ERP actions',
    ],
    relatedLinks: [
      { href: '/app/ai/voice-assistant', label: 'AI Voice workbench' },
      { href: '/app/ai/chat-erp', label: 'Chat ERP' },
      { href: '/app/mobile', label: 'Mobile workspace' },
      { href: '/app/procurement/orders/new', label: 'Create purchase order' },
    ],
    eyebrowClassName: 'text-slate-700 dark:text-slate-300',
    hoverClassName: 'hover:border-slate-300 dark:hover:border-slate-700',
    actionClassName: 'text-slate-700 dark:text-slate-300',
    apiPreview: 'assistants',
  },
  {
    slug: 'meeting-summary',
    key: 'AI_MEETING_SUMMARY',
    area: 'ASSISTANTS',
    href: '/app/ai/meeting-summary',
    label: 'AI Meeting Summary',
    badge: 'Assistants',
    eyebrow: 'Meeting Summary',
    title: 'Turn meetings into structured actions, owners, and follow-up momentum',
    description:
      'Meeting summary lane membantu sales, vendor, atau internal team merangkum keputusan dan next step tanpa kehilangan konteks percakapan.',
    highlights: [
      'Decision and action extraction',
      'Owner and deadline capture',
      'Follow-up routing into work queues',
      'Conversation recap packaging',
      'Audio upload summarization',
    ],
    relatedLinks: [
      { href: '/app/ai/meeting-summary', label: 'AI Meeting workbench' },
      { href: '/app/crm/meetings', label: 'CRM meetings' },
      { href: '/app/ai/reports', label: 'AI reports' },
      { href: '/app/automation/reminders', label: 'Automation reminders' },
    ],
    eyebrowClassName: 'text-slate-700 dark:text-slate-300',
    hoverClassName: 'hover:border-slate-300 dark:hover:border-slate-700',
    actionClassName: 'text-slate-700 dark:text-slate-300',
    apiPreview: 'assistants',
  },
];

export function getAiCapabilityItem(slug: string) {
  return aiCapabilityCatalog.find((capability) => capability.slug === slug);
}
