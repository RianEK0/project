import { HttpStatus, Injectable } from '@nestjs/common';
import {
  aiDocumentConfidenceBands,
  aiDocumentSaveStatuses,
  aiOcrDocumentTypes,
  aiRequestStatuses,
  type AiDocumentConfidenceBand,
  type AiDocumentSaveStatus,
  type AiOcrDocumentType,
  type AiRequestStatus,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

const acceptedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] as const;

type UploadedDocumentInput = {
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  documentType?: string;
};

type OcrLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type OcrDatabaseTarget = {
  entity: string;
  action: string;
  mappedFields: string[];
};

export type AiDocumentOcrFoundation = {
  items: unknown[];
  statuses: readonly AiRequestStatus[];
  documentTypes: readonly AiOcrDocumentType[];
  confidenceBands: readonly AiDocumentConfidenceBand[];
  saveStatuses: readonly AiDocumentSaveStatus[];
  acceptedMimeTypes: readonly string[];
  extractedFields: string[];
  databaseTargets: string[];
};

export type AiDocumentOcrExtraction = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  documentType: AiOcrDocumentType;
  requestStatus: AiRequestStatus;
  saveStatus: AiDocumentSaveStatus;
  confidenceBand: AiDocumentConfidenceBand;
  confidencePct: number;
  detectedLanguage: string;
  supplier: string;
  invoiceDate: string;
  invoiceNumber: string;
  ppnAmount: number;
  subtotalAmount: number;
  totalAmount: number;
  currency: string;
  items: OcrLineItem[];
  warnings: string[];
  databaseWritePreview: OcrDatabaseTarget[];
};

@Injectable()
export class AiDocumentOcrService {
  getFoundation(): AiDocumentOcrFoundation {
    return {
      items: [],
      statuses: aiRequestStatuses,
      documentTypes: aiOcrDocumentTypes,
      confidenceBands: aiDocumentConfidenceBands,
      saveStatuses: aiDocumentSaveStatuses,
      acceptedMimeTypes,
      extractedFields: ['Supplier', 'Tanggal', 'Nomor', 'PPN', 'Item', 'Harga'],
      databaseTargets: ['Supplier', 'Invoice', 'InvoiceItem', 'PurchaseInvoicePreparation'],
    };
  }

  extract(input: UploadedDocumentInput): AiDocumentOcrExtraction {
    const fileName = input.fileName?.trim();
    const mimeType = input.mimeType?.trim();
    const sizeBytes = input.sizeBytes ?? 0;

    if (!fileName || !mimeType || sizeBytes <= 0) {
      throw new AppException(
        ERROR_CODES.AI_DOCUMENT_FILE_REQUIRED,
        'A document file is required for OCR extraction.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!acceptedMimeTypes.includes(mimeType as (typeof acceptedMimeTypes)[number])) {
      throw new AppException(
        ERROR_CODES.AI_DOCUMENT_TYPE_UNSUPPORTED,
        `Unsupported OCR file type: ${mimeType}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const documentType = this.resolveDocumentType(fileName, input.documentType);
    const scenario = this.buildScenario(documentType);
    const confidenceBand = this.resolveConfidenceBand(scenario.confidencePct);
    const saveStatus = scenario.confidencePct >= 86 ? 'READY_TO_SAVE' : 'REVIEW_NEEDED';

    return {
      fileName,
      mimeType,
      sizeBytes,
      documentType,
      requestStatus: 'COMPLETED',
      saveStatus,
      confidenceBand,
      confidencePct: scenario.confidencePct,
      detectedLanguage: 'id-ID',
      supplier: scenario.supplier,
      invoiceDate: scenario.invoiceDate,
      invoiceNumber: scenario.invoiceNumber,
      ppnAmount: scenario.ppnAmount,
      subtotalAmount: scenario.subtotalAmount,
      totalAmount: scenario.totalAmount,
      currency: 'IDR',
      items: scenario.items,
      warnings: scenario.warnings,
      databaseWritePreview: scenario.databaseWritePreview,
    };
  }

  private resolveDocumentType(fileName: string, documentType?: string): AiOcrDocumentType {
    if (documentType) {
      if (!aiOcrDocumentTypes.includes(documentType as AiOcrDocumentType)) {
        throw new AppException(
          ERROR_CODES.AI_DOCUMENT_INPUT_INVALID,
          `Unsupported OCR document type: ${documentType}.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      return documentType as AiOcrDocumentType;
    }

    const normalized = fileName.toLowerCase();

    if (normalized.includes('invoice') || normalized.includes('faktur')) {
      return 'INVOICE';
    }
    if (normalized.includes('receipt') || normalized.includes('kwitansi')) {
      return 'RECEIPT';
    }
    if (normalized.includes('po') || normalized.includes('purchase-order')) {
      return 'PURCHASE_ORDER';
    }

    return 'GENERAL';
  }

  private resolveConfidenceBand(confidencePct: number): AiDocumentConfidenceBand {
    if (confidencePct >= 88) {
      return 'HIGH';
    }
    if (confidencePct >= 70) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  private buildScenario(documentType: AiOcrDocumentType) {
    switch (documentType) {
      case 'INVOICE':
        return {
          confidencePct: 91,
          supplier: 'PT Sumber Niaga Prima',
          invoiceDate: '2026-07-22',
          invoiceNumber: 'INV-SNP-2026-0719',
          ppnAmount: 228000,
          subtotalAmount: 1520000,
          totalAmount: 1748000,
          items: [
            {
              description: 'Karton arsip legal size',
              quantity: 20,
              unitPrice: 28000,
              lineTotal: 560000,
            },
            {
              description: 'Label thermal barcode',
              quantity: 8,
              unitPrice: 95000,
              lineTotal: 760000,
            },
            {
              description: 'Tinta printer warehouse',
              quantity: 2,
              unitPrice: 100000,
              lineTotal: 200000,
            },
          ],
          warnings: [
            'Vendor name matched with an existing supplier profile candidate.',
            'Tax amount is ready to map into invoice and journal preparation review.',
          ],
          databaseWritePreview: [
            {
              entity: 'Supplier',
              action: 'MATCH_OR_CREATE',
              mappedFields: ['name', 'taxId', 'billingAddress'],
            },
            {
              entity: 'Invoice',
              action: 'CREATE_DRAFT',
              mappedFields: [
                'invoiceNumber',
                'invoiceDate',
                'subtotalAmount',
                'ppnAmount',
                'totalAmount',
              ],
            },
            {
              entity: 'InvoiceItem',
              action: 'UPSERT_LINES',
              mappedFields: ['description', 'quantity', 'unitPrice', 'lineTotal'],
            },
          ],
        };
      case 'RECEIPT':
        return {
          confidencePct: 84,
          supplier: 'Gudang Distribusi Barat',
          invoiceDate: '2026-07-24',
          invoiceNumber: 'RCT-2026-4407',
          ppnAmount: 0,
          subtotalAmount: 640000,
          totalAmount: 640000,
          items: [
            {
              description: 'Bahan kemasan inbound',
              quantity: 16,
              unitPrice: 40000,
              lineTotal: 640000,
            },
          ],
          warnings: [
            'Receipt references need a receiving document match before posting.',
            'Human review is recommended because no tax signal was detected.',
          ],
          databaseWritePreview: [
            {
              entity: 'PurchaseReceipt',
              action: 'MATCH_OR_CREATE',
              mappedFields: ['receiptNumber', 'receiptDate', 'supplierName'],
            },
            {
              entity: 'InvoiceItem',
              action: 'CREATE_DRAFT_LINES',
              mappedFields: ['description', 'quantity', 'unitPrice'],
            },
          ],
        };
      case 'PURCHASE_ORDER':
        return {
          confidencePct: 87,
          supplier: 'PT Atlas Fasteners',
          invoiceDate: '2026-07-20',
          invoiceNumber: 'PO-2026-0081',
          ppnAmount: 315000,
          subtotalAmount: 2100000,
          totalAmount: 2415000,
          items: [
            {
              description: 'Stainless bolt set M8',
              quantity: 300,
              unitPrice: 4500,
              lineTotal: 1350000,
            },
            {
              description: 'Safety gasket roll',
              quantity: 15,
              unitPrice: 50000,
              lineTotal: 750000,
            },
          ],
          warnings: ['Purchase order number is ready to reconcile with procurement orders.'],
          databaseWritePreview: [
            {
              entity: 'PurchaseOrder',
              action: 'MATCH_EXISTING',
              mappedFields: ['orderNumber', 'supplierName', 'totalAmount'],
            },
            {
              entity: 'PurchaseInvoicePreparation',
              action: 'CREATE_DRAFT',
              mappedFields: ['referenceNumber', 'taxAmount', 'lineSummary'],
            },
          ],
        };
      case 'GENERAL':
        return {
          confidencePct: 72,
          supplier: 'Unclassified document source',
          invoiceDate: '2026-07-26',
          invoiceNumber: 'OCR-GEN-2026-0726',
          ppnAmount: 0,
          subtotalAmount: 0,
          totalAmount: 0,
          items: [
            {
              description: 'General OCR capture for manual review',
              quantity: 1,
              unitPrice: 0,
              lineTotal: 0,
            },
          ],
          warnings: [
            'Document type could not be inferred confidently.',
            'Human review is required before writing any structured data to the database.',
          ],
          databaseWritePreview: [
            {
              entity: 'AiExtractionJob',
              action: 'QUEUE_REVIEW',
              mappedFields: ['fileName', 'mimeType', 'documentType'],
            },
          ],
        };
    }
  }
}
