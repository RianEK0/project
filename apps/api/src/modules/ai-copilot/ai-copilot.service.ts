import { HttpStatus, Injectable } from '@nestjs/common';
import {
  aiCopilotExecutionStatuses,
  aiCopilotExportFormats,
  aiCopilotIntentTypes,
  aiModelModes,
  aiRequestStatuses,
  type AiCopilotExecutionStatus,
  type AiCopilotExportFormat,
  type AiCopilotIntentType,
  type AiModelMode,
  type AiRequestStatus,
  type AiSearchDomain,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type AiCopilotPreviewInput = {
  prompt?: string;
};

type AiCopilotMetric = {
  label: string;
  value: string;
  note: string;
};

type AiCopilotChartPoint = {
  label: string;
  value: number;
};

type AiCopilotDataRow = {
  primary: string;
  secondary: string;
  tertiary: string;
};

type AiCopilotDraftAction = {
  label: string;
  route: string;
  rationale: string;
};

export type AiCopilotFoundation = {
  items: unknown[];
  statuses: readonly AiRequestStatus[];
  modelModes: readonly AiModelMode[];
  intentTypes: readonly AiCopilotIntentType[];
  executionStatuses: readonly AiCopilotExecutionStatus[];
  exportFormats: readonly AiCopilotExportFormat[];
  supportedDomains: AiSearchDomain[];
  samplePrompts: string[];
  guardrails: string[];
  responsePrinciples: string[];
};

export type AiCopilotPreview = {
  prompt: string;
  normalizedPrompt: string;
  requestStatus: AiRequestStatus;
  modelMode: AiModelMode;
  intentType: AiCopilotIntentType;
  executionStatus: AiCopilotExecutionStatus;
  primaryDomain: AiSearchDomain;
  coverageWindow: string;
  chartTitle: string;
  chartPoints: AiCopilotChartPoint[];
  summary: string;
  metrics: AiCopilotMetric[];
  dataRows: AiCopilotDataRow[];
  narrative: string[];
  safeQueryPlan: string[];
  suggestedExports: AiCopilotExportFormat[];
  draftActions: AiCopilotDraftAction[];
};

@Injectable()
export class AiCopilotService {
  getFoundation(): AiCopilotFoundation {
    return {
      items: [],
      statuses: aiRequestStatuses,
      modelModes: aiModelModes,
      intentTypes: aiCopilotIntentTypes,
      executionStatuses: aiCopilotExecutionStatuses,
      exportFormats: aiCopilotExportFormats,
      supportedDomains: ['SALES', 'INVENTORY', 'PROCUREMENT', 'FINANCE', 'ANALYTICS'],
      samplePrompts: [
        'Buat laporan penjualan bulan lalu.',
        'Stok apa yang perlu segera dipesan?',
        'Ringkas arus kas minggu ini.',
        'Siapkan tindakan procurement untuk vendor yang lead time-nya memburuk.',
      ],
      responsePrinciples: [
        'Jawaban memakai bahasa yang sederhana dan langsung ke inti.',
        'AI menjelaskan angka atau risiko penting sebelum memberi saran.',
        'Setiap jawaban ditutup dengan langkah lanjut yang bisa dipilih user.',
      ],
      guardrails: [
        'Copilot hanya menyiapkan query aman, ringkasan, dan draft action; posting final tetap di workspace sumber.',
        'Ekspor PDF atau Excel harus memakai dataset yang sudah lolos tenant scope dan permission check.',
        'Rekomendasi PO, cash flow, dan laporan penjualan tetap harus bisa ditelusuri ke tabel sumber yang aman.',
      ],
    };
  }

  preview(input: AiCopilotPreviewInput): AiCopilotPreview {
    const prompt = input.prompt?.trim();

    if (!prompt) {
      throw new AppException(
        ERROR_CODES.AI_COPILOT_INPUT_INVALID,
        'A copilot prompt is required for AI Copilot preview.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const normalizedPrompt = prompt.replaceAll(/\s+/g, ' ');
    const lowered = normalizedPrompt.toLowerCase();

    if (lowered.includes('stok') || lowered.includes('dipesan') || lowered.includes('lead time')) {
      return this.buildReplenishmentPreview(normalizedPrompt);
    }

    if (lowered.includes('cash flow') || lowered.includes('arus kas')) {
      return this.buildCashFlowPreview(normalizedPrompt);
    }

    if (
      lowered.includes('procurement') ||
      lowered.includes('purchase order') ||
      lowered.includes('vendor')
    ) {
      return this.buildProcurementPreview(normalizedPrompt);
    }

    return this.buildSalesPreview(normalizedPrompt);
  }

  private buildSalesPreview(normalizedPrompt: string): AiCopilotPreview {
    return {
      prompt: normalizedPrompt,
      normalizedPrompt,
      requestStatus: 'COMPLETED',
      modelMode: 'HYBRID',
      intentType: 'SALES_REPORT',
      executionStatus: 'SAFE_QUERY_READY',
      primaryDomain: 'SALES',
      coverageWindow: 'June 1, 2026 - June 30, 2026',
      chartTitle: 'Weekly recognized sales during June 2026',
      chartPoints: [
        { label: 'Week 1', value: 1180 },
        { label: 'Week 2', value: 1240 },
        { label: 'Week 3', value: 1095 },
        { label: 'Week 4', value: 1305 },
      ],
      summary:
        'Saya membaca data penjualan, pengiriman, dan invoice untuk 1-30 Juni 2026. Hasilnya, Copilot bisa menyiapkan tabel, grafik, dan ringkasan bulanan yang mudah dibaca tanpa mengubah data sumber.',
      metrics: [
        { label: 'Revenue', value: 'Rp 4,82 miliar', note: '+12,4% vs May 2026' },
        { label: 'Paid invoices', value: '128', note: '93% dari invoice June 2026 sudah tertagih' },
        {
          label: 'Gross margin',
          value: '31,8%',
          note: 'Tertinggi pada lane industrial spare parts',
        },
      ],
      dataRows: [
        {
          primary: 'West Java Distribution',
          secondary: 'Rp 1,18 miliar',
          tertiary: '22 invoice, 98% on-time shipment',
        },
        {
          primary: 'Central Spare Network',
          secondary: 'Rp 930 juta',
          tertiary: '18 invoice, margin 33,1%',
        },
        {
          primary: 'Direct SME Channel',
          secondary: 'Rp 690 juta',
          tertiary: '41 invoice, diskon efektif 4,2%',
        },
      ],
      narrative: [
        'Penjualan paling kuat datang dari spare parts industri, dengan puncak pengiriman terjadi pada minggu keempat Juni 2026.',
        'Penagihan masih tergolong sehat, tetapi dua pelanggan besar sudah melewati termin normal lebih dari tujuh hari.',
        'Langkah paling masuk akal adalah melihat sales analytics dan memulai follow-up collection pada dua account dengan AR tertinggi.',
      ],
      safeQueryPlan: [
        'Scope tenant, company, dan branch dari permission user saat ini.',
        'Ambil sales order dan sales invoice untuk June 1-30, 2026, dengan filter status terkirim dan terbit.',
        'Gabungkan ringkasan pengiriman, pembayaran, dan diskon agar tabel serta grafik tetap konsisten.',
        'Bangun narrative dan ekspor tanpa mengeksekusi perubahan data sumber.',
      ],
      suggestedExports: ['PDF', 'EXCEL', 'DASHBOARD_LINK'],
      draftActions: [
        {
          label: 'Open Sales Analytics',
          route: '/app/sales/analytics',
          rationale: 'Buka rincian penjualan, margin, dan collection per channel agar keputusan berikutnya lebih akurat.',
        },
        {
          label: 'Generate PDF summary',
          route: '/app/ai/reports',
          rationale: 'Siapkan ringkasan bulanan yang siap dibagikan ke manajer tanpa membuka data mentah.',
        },
      ],
    };
  }

  private buildReplenishmentPreview(normalizedPrompt: string): AiCopilotPreview {
    return {
      prompt: normalizedPrompt,
      normalizedPrompt,
      requestStatus: 'COMPLETED',
      modelMode: 'HYBRID',
      intentType: 'REPLENISHMENT_RECOMMENDATION',
      executionStatus: 'DRAFT_ACTION_READY',
      primaryDomain: 'INVENTORY',
      coverageWindow: 'May 1, 2026 - July 25, 2026',
      chartTitle: 'Critical replenishment score by SKU',
      chartPoints: [
        { label: 'Bearing 6204', value: 92 },
        { label: 'Filter Kit A9', value: 88 },
        { label: 'Seal Pack K2', value: 81 },
        { label: 'Hydraulic Hose 3/4', value: 77 },
      ],
      summary:
        'Saya membandingkan stok saat ini, lead time pemasok, dan permintaan 60 hari terakhir. Dari situ, Copilot menyiapkan rekomendasi pembelian untuk SKU yang paling mendesak lebih dulu.',
      metrics: [
        {
          label: 'Critical SKUs',
          value: '6',
          note: '3 SKU akan jatuh di bawah safety stock dalam 5 hari',
        },
        {
          label: 'Supplier risk',
          value: '3 vendor',
          note: 'Lead time memburuk 2-5 hari dibanding June 2026',
        },
        { label: 'Draft PO value', value: 'Rp 286 juta', note: 'Disusun untuk dua supplier utama' },
      ],
      dataRows: [
        {
          primary: 'Bearing 6204',
          secondary: 'Order 120 unit dari PT Sumber Baja',
          tertiary: 'Stock 18, lead time 14 hari, demand 11 unit/hari',
        },
        {
          primary: 'Filter Kit A9',
          secondary: 'Order 80 unit dari CV Prima Teknika',
          tertiary: 'Stock 22, lead time 9 hari, demand 7 unit/hari',
        },
        {
          primary: 'Seal Pack K2',
          secondary: 'Order 60 unit dari PT Delta Supply',
          tertiary: 'Stock 15, lead time 12 hari, demand 5 unit/hari',
        },
      ],
      narrative: [
        'Tiga SKU utama menunjukkan stok yang menipis, permintaan yang stabil, dan lead time pemasok yang memburuk di paruh kedua Juli 2026.',
        'Copilot sengaja menyiapkan draft tindakan lebih dulu, bukan langsung membuat PO final, supaya buyer tetap bisa meninjau vendor dan harga.',
        'Ada supplier alternatif untuk dua SKU, tetapi harganya saat ini sekitar 4-6% lebih tinggi dari vendor utama.',
      ],
      safeQueryPlan: [
        'Baca stock on hand, reserved quantity, dan open inbound receipts per SKU.',
        'Gabungkan histori issue, sales delivery, dan purchase receipt dari May 1, 2026 sampai July 25, 2026.',
        'Hitung safety stock, days of cover, dan supplier lead time delta sebelum menyusun ranking.',
        'Buat draft action ke procurement tanpa menulis purchase order final secara otomatis.',
      ],
      suggestedExports: ['EXCEL', 'PDF', 'DASHBOARD_LINK'],
      draftActions: [
        {
          label: 'Create Purchase Request draft',
          route: '/app/procurement/purchase-requests',
          rationale:
            'Buka draft permintaan pembelian dengan konteks demand dan lead time agar buyer tidak perlu merangkum ulang dari awal.',
        },
        {
          label: 'Review Vendor Comparison',
          route: '/app/procurement/vendor-comparison',
          rationale: 'Bandingkan harga dan lead time vendor alternatif sebelum PO final diterbitkan.',
        },
      ],
    };
  }

  private buildCashFlowPreview(normalizedPrompt: string): AiCopilotPreview {
    return {
      prompt: normalizedPrompt,
      normalizedPrompt,
      requestStatus: 'COMPLETED',
      modelMode: 'HYBRID',
      intentType: 'CASH_FLOW_BRIEF',
      executionStatus: 'SAFE_QUERY_READY',
      primaryDomain: 'FINANCE',
      coverageWindow: 'July 20, 2026 - July 26, 2026',
      chartTitle: 'Net cash movement by day',
      chartPoints: [
        { label: 'Jul 20', value: 320 },
        { label: 'Jul 21', value: 280 },
        { label: 'Jul 22', value: 410 },
        { label: 'Jul 23', value: 260 },
        { label: 'Jul 24', value: 450 },
      ],
      summary:
        'Saya merangkum kas masuk, kas keluar, dan invoice yang jatuh tempo pada minggu berjalan. Hasilnya disusun agar tim finance cepat melihat posisi kas dan risiko yang perlu dijaga.',
      metrics: [
        { label: 'Net cash', value: 'Rp 1,72 miliar', note: '+9,1% vs pekan sebelumnya' },
        {
          label: 'Payables due',
          value: 'Rp 640 juta',
          note: '3 vendor jatuh tempo sebelum July 31, 2026',
        },
        {
          label: 'Receivables at risk',
          value: 'Rp 410 juta',
          note: '2 pelanggan melampaui termin normal',
        },
      ],
      dataRows: [
        {
          primary: 'Collections',
          secondary: 'Rp 2,46 miliar',
          tertiary: 'Mayoritas dari invoice distributor Jawa Barat',
        },
        {
          primary: 'Supplier payouts',
          secondary: 'Rp 1,09 miliar',
          tertiary: 'Didominasi pembelian material dan pengiriman',
        },
      ],
      narrative: [
        'Kas masuk masih cukup sehat, tetapi pembayaran vendor di akhir Juli 2026 perlu dijaga agar buffer kas tetap aman.',
        'Sebelum menyetujui pembayaran besar berikutnya, tim finance sebaiknya membuka ageing receivable dan payment schedule lebih dulu.',
      ],
      safeQueryPlan: [
        'Tarik kas bank, cash account, receivable, dan payable yang jatuh tempo pada minggu berjalan.',
        'Kelompokkan transaksi menurut tanggal dan jenis arus kas tanpa membuka jurnal detail yang tidak relevan.',
      ],
      suggestedExports: ['PDF', 'EXCEL'],
      draftActions: [
        {
          label: 'Open Cash Flow statement',
          route: '/app/finance/cash-flow',
          rationale: 'Lihat rincian arus kas operasional, investasi, dan pendanaan untuk memastikan sumber tekanan kasnya.',
        },
      ],
    };
  }

  private buildProcurementPreview(normalizedPrompt: string): AiCopilotPreview {
    return {
      prompt: normalizedPrompt,
      normalizedPrompt,
      requestStatus: 'COMPLETED',
      modelMode: 'HYBRID',
      intentType: 'PROCUREMENT_ACTION',
      executionStatus: 'DRAFT_ACTION_READY',
      primaryDomain: 'PROCUREMENT',
      coverageWindow: 'July 1, 2026 - July 26, 2026',
      chartTitle: 'Vendor lead-time drift this month',
      chartPoints: [
        { label: 'PT Sumber Baja', value: 5 },
        { label: 'CV Prima Teknika', value: 3 },
        { label: 'PT Delta Supply', value: 2 },
      ],
      summary:
        'Saya membaca lead time vendor, RFQ aktif, dan risiko stok yang sedang terbuka. Dari situ, Copilot menyiapkan daftar tindakan procurement yang paling layak dikerjakan lebih dulu.',
      metrics: [
        {
          label: 'RFQ active',
          value: '4',
          note: '2 di antaranya perlu keputusan supplier minggu ini',
        },
        {
          label: 'Lead-time drift',
          value: '+3,3 hari',
          note: 'Rata-rata pada vendor berisiko tinggi',
        },
        { label: 'Potential PO draft', value: '3', note: 'Siap dilanjutkan ke buyer review' },
      ],
      dataRows: [
        {
          primary: 'PT Sumber Baja',
          secondary: 'Lead time naik 5 hari',
          tertiary: 'Tinjau supplier cadangan dan blanket order',
        },
        {
          primary: 'CV Prima Teknika',
          secondary: 'RFQ bernilai Rp 124 juta',
          tertiary: 'Perlu vendor comparison sebelum approval',
        },
      ],
      narrative: [
        'Lead time vendor memburuk pada dua kelompok material utama, jadi buyer sebaiknya mulai mengecek supplier cadangan.',
        'Copilot hanya menyiapkan draft tindakan, bukan PO final, agar approval dan vendor comparison tetap berjalan sesuai proses.',
      ],
      safeQueryPlan: [
        'Baca RFQ, quotation, vendor comparison, open purchase request, dan histori lead time vendor.',
        'Rangking supplier exposure berdasarkan due date, stock risk, dan nilai pembelian potensial.',
      ],
      suggestedExports: ['EXCEL', 'PDF'],
      draftActions: [
        {
          label: 'Open RFQ board',
          route: '/app/procurement/rfq',
          rationale: 'Fokuskan tim pada RFQ yang paling dekat jatuh tempo agar keputusan vendor tidak terlambat.',
        },
        {
          label: 'Prepare Purchase Order draft',
          route: '/app/procurement/orders',
          rationale: 'Buka draft PO yang sudah dilengkapi sinyal vendor dan lead time supaya proses buyer lebih cepat.',
        },
      ],
    };
  }
}
