import { HttpStatus, Injectable } from '@nestjs/common';
import {
  aiModelModes,
  aiRequestStatuses,
  aiSearchDomains,
  aiVoiceConfirmationModes,
  aiVoiceExecutionStatuses,
  aiVoiceIntentTypes,
  type AiModelMode,
  type AiRequestStatus,
  type AiSearchDomain,
  type AiVoiceConfirmationMode,
  type AiVoiceExecutionStatus,
  type AiVoiceIntentType,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type VoiceCommandInput = {
  transcript?: string;
};

type VoiceField = {
  label: string;
  value: string;
};

export type AiVoiceFoundation = {
  items: unknown[];
  statuses: readonly AiRequestStatus[];
  intentTypes: readonly AiVoiceIntentType[];
  modelModes: readonly AiModelMode[];
  executionStatuses: readonly AiVoiceExecutionStatus[];
  confirmationModes: readonly AiVoiceConfirmationMode[];
  supportedDomains: readonly AiSearchDomain[];
  sampleCommands: string[];
};

export type AiVoiceExecutionPreview = {
  transcript: string;
  normalizedTranscript: string;
  requestStatus: AiRequestStatus;
  modelMode: AiModelMode;
  intentType: AiVoiceIntentType;
  executionStatus: AiVoiceExecutionStatus;
  confirmationMode: AiVoiceConfirmationMode;
  summary: string;
  spokenResponse: string;
  targetRoute: string;
  generatedRecordNumber: string;
  extractedParameters: VoiceField[];
  nextActions: string[];
};

@Injectable()
export class AiVoiceService {
  getFoundation(): AiVoiceFoundation {
    return {
      items: [],
      statuses: aiRequestStatuses,
      intentTypes: aiVoiceIntentTypes,
      modelModes: aiModelModes,
      executionStatuses: aiVoiceExecutionStatuses,
      confirmationModes: aiVoiceConfirmationModes,
      supportedDomains: aiSearchDomains,
      sampleCommands: [
        'Buat Purchase Order untuk Supplier ABC sebanyak 50 unit',
        'Buat purchase request untuk gudang Jakarta sebanyak 20 unit label barcode',
        'Cek stok fastener M8 di warehouse utama',
        'Cari invoice INV-2026-00917',
      ],
    };
  }

  executePreview(input: VoiceCommandInput): AiVoiceExecutionPreview {
    const transcript = input.transcript?.trim();

    if (!transcript) {
      throw new AppException(
        ERROR_CODES.AI_VOICE_INPUT_INVALID,
        'A speech transcript is required for AI Voice preview.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const normalizedTranscript = transcript.toLowerCase();
    const scenario = this.buildScenario(transcript, normalizedTranscript);

    return {
      transcript,
      normalizedTranscript,
      requestStatus: 'COMPLETED',
      modelMode: scenario.modelMode,
      intentType: scenario.intentType,
      executionStatus: scenario.executionStatus,
      confirmationMode: scenario.confirmationMode,
      summary: scenario.summary,
      spokenResponse: scenario.spokenResponse,
      targetRoute: scenario.targetRoute,
      generatedRecordNumber: scenario.generatedRecordNumber,
      extractedParameters: scenario.extractedParameters,
      nextActions: scenario.nextActions,
    };
  }

  private buildScenario(transcript: string, normalizedTranscript: string) {
    if (normalizedTranscript.includes('purchase order') || normalizedTranscript.includes('po')) {
      const supplierName = this.extractSupplierName(transcript) ?? 'Supplier ABC';
      const quantity = this.extractFirstInteger(transcript) ?? 50;

      return {
        modelMode: 'HYBRID' as const,
        intentType: 'CREATE_PURCHASE_ORDER' as const,
        executionStatus: 'DRAFT_CREATED' as const,
        confirmationMode: 'VOICE_CONFIRMATION' as const,
        summary:
          'AI Voice menyiapkan draft purchase order baru dari perintah lisan lengkap dengan supplier, kuantitas, dan route tindak lanjut procurement.',
        spokenResponse: `Draft purchase order untuk ${supplierName} sebanyak ${quantity} unit sudah disiapkan dan menunggu review harga.`,
        targetRoute: '/app/procurement/orders/new',
        generatedRecordNumber: 'PO-DRAFT-2026-0726-01',
        extractedParameters: [
          { label: 'Intent', value: 'Create Purchase Order' },
          { label: 'Supplier', value: supplierName },
          { label: 'Quantity', value: `${quantity} unit` },
          { label: 'Review owner', value: 'Procurement Lead' },
        ],
        nextActions: [
          'Review unit price and delivery date before submitting the draft PO on Sunday, July 26, 2026.',
          'Escalate to purchase approval if the final amount exceeds IDR 50,000,000.',
        ],
      };
    }

    if (normalizedTranscript.includes('purchase request')) {
      const quantity = this.extractFirstInteger(transcript) ?? 20;

      return {
        modelMode: 'HYBRID' as const,
        intentType: 'CREATE_PURCHASE_REQUEST' as const,
        executionStatus: 'DRAFT_CREATED' as const,
        confirmationMode: 'PIN_CONFIRMATION' as const,
        summary:
          'AI Voice mengubah permintaan lisan menjadi draft purchase request dan menyiapkan route ke approval procurement.',
        spokenResponse:
          'Draft purchase request sudah dibuat dan siap dikirim ke approver setelah Anda konfirmasi PIN.',
        targetRoute: '/app/procurement/requests/new',
        generatedRecordNumber: 'PR-DRAFT-2026-0726-04',
        extractedParameters: [
          { label: 'Intent', value: 'Create Purchase Request' },
          { label: 'Quantity', value: `${quantity} unit` },
          { label: 'Warehouse', value: 'Gudang Jakarta' },
          { label: 'Approval path', value: 'Supervisor -> Procurement Manager' },
        ],
        nextActions: [
          'Confirm requester and cost center before submitting the draft PR.',
          'Attach the warehouse shortage note if this request is tied to a low-stock event.',
        ],
      };
    }

    if (normalizedTranscript.includes('stok') || normalizedTranscript.includes('stock')) {
      return {
        modelMode: 'RULE_BASED' as const,
        intentType: 'CHECK_STOCK' as const,
        executionStatus: 'ROUTED_TO_WORKSPACE' as const,
        confirmationMode: 'VOICE_CONFIRMATION' as const,
        summary:
          'AI Voice mengenali permintaan cek stok dan mengarahkan user ke inventory workspace dengan ringkasan SKU dan warehouse relevan.',
        spokenResponse:
          'Saya arahkan ke inventory untuk melihat stok fastener M8 dan reservasi aktifnya.',
        targetRoute: '/app/inventory',
        generatedRecordNumber: 'ROUTE-INVENTORY-2026-0726',
        extractedParameters: [
          { label: 'Intent', value: 'Check Stock' },
          { label: 'SKU', value: 'FAST-M8' },
          { label: 'Warehouse', value: 'Warehouse Utama' },
        ],
        nextActions: [
          'Open lot and reservation details after landing on inventory workspace.',
          'Escalate to a purchase request if available stock drops below the reorder threshold.',
        ],
      };
    }

    return {
      modelMode: 'LLM_ASSISTED' as const,
      intentType: 'LOOKUP_INVOICE' as const,
      executionStatus: 'ROUTED_TO_WORKSPACE' as const,
      confirmationMode: 'VOICE_CONFIRMATION' as const,
      summary:
        'AI Voice mengenali pencarian invoice dan mengarahkan user ke finance or sales invoice workspace sesuai konteks nomor dokumen.',
      spokenResponse:
        'Saya arahkan ke invoice workspace dan menyiapkan pencarian berdasarkan nomor dokumen yang Anda sebutkan.',
      targetRoute: '/app/invoices',
      generatedRecordNumber: 'LOOKUP-INV-2026-0726',
      extractedParameters: [
        { label: 'Intent', value: 'Lookup Invoice' },
        { label: 'Reference', value: this.extractInvoiceNumber(transcript) ?? 'INV-2026-00917' },
        { label: 'Route owner', value: 'Finance Operations' },
      ],
      nextActions: [
        'Review invoice status, due date, and payment allocation after opening the workspace.',
        'Escalate to collections workflow if the invoice is overdue.',
      ],
    };
  }

  private extractSupplierName(transcript: string) {
    const supplierMatch = transcript.match(/supplier\s+([a-z0-9\s.-]+)/i);

    return supplierMatch?.[1]?.trim().replace(/\s+sebanyak.*$/i, '');
  }

  private extractFirstInteger(transcript: string) {
    const numberMatch = transcript.match(/\b(\d+)\b/);

    if (!numberMatch?.[1]) {
      return null;
    }

    return Number.parseInt(numberMatch[1], 10);
  }

  private extractInvoiceNumber(transcript: string) {
    const invoiceMatch = transcript.match(/(inv[-\s]?\d{4}[-\s]?\d+)/i);

    return invoiceMatch?.[1]?.toUpperCase().replaceAll(' ', '-');
  }
}
