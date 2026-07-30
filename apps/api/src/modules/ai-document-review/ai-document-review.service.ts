import { HttpStatus, Injectable } from '@nestjs/common';
import {
  aiDocumentReviewStatuses,
  aiDocumentReviewTypes,
  aiRequestStatuses,
  aiRecommendationPriorities,
  type AiDocumentReviewStatus,
  type AiDocumentReviewType,
  type AiRecommendationPriority,
  type AiRequestStatus,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

const acceptedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
] as const;

type UploadedReviewInput = {
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  documentType?: string;
};

type ReviewParty = {
  name: string;
  role: string;
};

type ReviewDeadline = {
  title: string;
  date: string;
  owner: string;
};

type ReviewRisk = {
  title: string;
  severity: AiRecommendationPriority;
  rationale: string;
};

export type AiDocumentReviewFoundation = {
  items: unknown[];
  statuses: readonly AiRequestStatus[];
  documentTypes: readonly AiDocumentReviewType[];
  reviewStatuses: readonly AiDocumentReviewStatus[];
  riskLevels: readonly AiRecommendationPriority[];
  acceptedMimeTypes: readonly string[];
  outputSections: string[];
};

export type AiDocumentReviewAnalysis = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  documentType: AiDocumentReviewType;
  requestStatus: AiRequestStatus;
  status: AiDocumentReviewStatus;
  summary: string;
  nominalAmount: number | null;
  currency: string | null;
  effectiveDate: string;
  expiryDate: string | null;
  parties: ReviewParty[];
  deadlines: ReviewDeadline[];
  risks: ReviewRisk[];
  extractedSignals: string[];
  recommendedActions: string[];
};

@Injectable()
export class AiDocumentReviewService {
  getFoundation(): AiDocumentReviewFoundation {
    return {
      items: [],
      statuses: aiRequestStatuses,
      documentTypes: aiDocumentReviewTypes,
      reviewStatuses: aiDocumentReviewStatuses,
      riskLevels: aiRecommendationPriorities,
      acceptedMimeTypes,
      outputSections: ['Ringkasan', 'Deadline', 'Risiko', 'Nominal', 'Pihak', 'Status'],
    };
  }

  analyze(input: UploadedReviewInput): AiDocumentReviewAnalysis {
    const fileName = input.fileName?.trim();
    const mimeType = input.mimeType?.trim();
    const sizeBytes = input.sizeBytes ?? 0;

    if (!fileName || !mimeType || sizeBytes <= 0) {
      throw new AppException(
        ERROR_CODES.AI_DOCUMENT_FILE_REQUIRED,
        'A document file is required for AI document review.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!acceptedMimeTypes.includes(mimeType as (typeof acceptedMimeTypes)[number])) {
      throw new AppException(
        ERROR_CODES.AI_DOCUMENT_TYPE_UNSUPPORTED,
        `Unsupported document review file type: ${mimeType}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const documentType = this.resolveDocumentType(fileName, input.documentType);
    const scenario = this.buildScenario(documentType);

    return {
      fileName,
      mimeType,
      sizeBytes,
      documentType,
      requestStatus: 'COMPLETED',
      status: scenario.status,
      summary: scenario.summary,
      nominalAmount: scenario.nominalAmount,
      currency: scenario.currency,
      effectiveDate: scenario.effectiveDate,
      expiryDate: scenario.expiryDate,
      parties: scenario.parties,
      deadlines: scenario.deadlines,
      risks: scenario.risks,
      extractedSignals: scenario.extractedSignals,
      recommendedActions: scenario.recommendedActions,
    };
  }

  private resolveDocumentType(fileName: string, documentType?: string): AiDocumentReviewType {
    if (documentType) {
      if (!aiDocumentReviewTypes.includes(documentType as AiDocumentReviewType)) {
        throw new AppException(
          ERROR_CODES.AI_DOCUMENT_INPUT_INVALID,
          `Unsupported document review type: ${documentType}.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      return documentType as AiDocumentReviewType;
    }

    const normalized = fileName.toLowerCase();

    if (normalized.includes('nda')) {
      return 'NDA';
    }
    if (normalized.includes('agreement')) {
      return 'AGREEMENT';
    }
    if (normalized.includes('po') || normalized.includes('purchase-order')) {
      return 'PURCHASE_ORDER';
    }
    if (normalized.includes('invoice')) {
      return 'INVOICE';
    }

    return 'CONTRACT';
  }

  private buildScenario(documentType: AiDocumentReviewType) {
    switch (documentType) {
      case 'CONTRACT':
        return {
          status: 'ACTIVE' as const,
          summary:
            'Kontrak pasokan tahunan ini mengikat pembelian minimum bulanan dengan harga tetap dan klausul penalti keterlambatan pengiriman.',
          nominalAmount: 275000000,
          currency: 'IDR',
          effectiveDate: '2026-07-15',
          expiryDate: '2027-07-14',
          parties: [
            { name: 'NovaERP Demo Company', role: 'Buyer' },
            { name: 'PT Sumber Niaga Prima', role: 'Supplier' },
          ],
          deadlines: [
            {
              title: 'Review service level addendum',
              date: '2026-08-05',
              owner: 'Procurement Manager',
            },
            {
              title: 'Confirm monthly volume baseline',
              date: '2026-08-12',
              owner: 'Operations Lead',
            },
          ],
          risks: [
            {
              title: 'Late-delivery penalty starts after 2 calendar days',
              severity: 'HIGH' as const,
              rationale:
                'Delivery tolerance is narrow relative to current replenishment lead-time variance.',
            },
            {
              title: 'Automatic renewal unless notice is sent 30 days before expiry',
              severity: 'MEDIUM' as const,
              rationale:
                'Renewal control can be missed if no reminder is set before June 14, 2027.',
            },
          ],
          extractedSignals: ['Minimum monthly commitment', 'Penalty clause', 'Auto-renewal clause'],
          recommendedActions: [
            'Create reminder for renewal notice cutoff on June 14, 2027.',
            'Link this contract to the supplier scorecard and purchase analytics review.',
          ],
        };
      case 'AGREEMENT':
        return {
          status: 'ACTIVE' as const,
          summary:
            'Agreement ini mendefinisikan ruang lingkup layanan, target respons, dan skema eskalasi untuk dukungan operasional cabang.',
          nominalAmount: 98000000,
          currency: 'IDR',
          effectiveDate: '2026-07-10',
          expiryDate: '2026-12-31',
          parties: [
            { name: 'NovaERP Demo Company', role: 'Service Recipient' },
            { name: 'PT Arunika Support Services', role: 'Service Provider' },
          ],
          deadlines: [
            {
              title: 'Validate SLA baseline',
              date: '2026-08-01',
              owner: 'Customer Success Manager',
            },
          ],
          risks: [
            {
              title: 'Escalation windows are not tied to named alternates',
              severity: 'MEDIUM' as const,
              rationale: 'Absence of backup contacts can slow breach handling.',
            },
          ],
          extractedSignals: ['SLA target', 'Escalation matrix', 'Branch service scope'],
          recommendedActions: [
            'Assign backup contacts for after-hours escalation before August 1, 2026.',
          ],
        };
      case 'NDA':
        return {
          status: 'PENDING_SIGNATURE' as const,
          summary:
            'NDA ini menutup pembagian data pelanggan, harga, dan materi internal selama fase evaluasi vendor baru.',
          nominalAmount: null,
          currency: null,
          effectiveDate: '2026-07-26',
          expiryDate: '2028-07-25',
          parties: [
            { name: 'NovaERP Demo Company', role: 'Disclosing Party' },
            { name: 'PT Delta Integrasi', role: 'Receiving Party' },
          ],
          deadlines: [
            { title: 'Collect counterparty signature', date: '2026-07-30', owner: 'Legal Ops' },
          ],
          risks: [
            {
              title: 'No explicit clause for subcontractor disclosure',
              severity: 'HIGH' as const,
              rationale:
                'Third-party handling risk remains open if the vendor uses implementation partners.',
            },
          ],
          extractedSignals: [
            'Confidential information definition',
            'Survival period',
            'Missing subcontractor clause',
          ],
          recommendedActions: ['Request subcontractor disclosure language before final signature.'],
        };
      case 'PURCHASE_ORDER':
        return {
          status: 'REVIEW_NEEDED' as const,
          summary:
            'Purchase order ini memesan komponen produksi dengan dua line utama dan mengandung termin pembayaran 30 hari setelah penerimaan.',
          nominalAmount: 2415000,
          currency: 'IDR',
          effectiveDate: '2026-07-20',
          expiryDate: null,
          parties: [
            { name: 'NovaERP Demo Company', role: 'Buyer' },
            { name: 'PT Atlas Fasteners', role: 'Supplier' },
          ],
          deadlines: [
            {
              title: 'Expected delivery window',
              date: '2026-08-03',
              owner: 'Warehouse Supervisor',
            },
            { title: 'Invoice matching review', date: '2026-08-07', owner: 'Finance Manager' },
          ],
          risks: [
            {
              title: 'Delivery date mismatch with current production demand plan',
              severity: 'HIGH' as const,
              rationale: 'A three-day delay would pressure the August 5, 2026 production schedule.',
            },
          ],
          extractedSignals: [
            'Payment term net 30',
            'Inbound expectation',
            'Linked production demand',
          ],
          recommendedActions: [
            'Escalate delivery feasibility with supplier before July 29, 2026.',
            'Prepare goods receipt exception flow if inbound arrives after August 3, 2026.',
          ],
        };
      case 'INVOICE':
        return {
          status: 'REVIEW_NEEDED' as const,
          summary:
            'Invoice vendor ini berisi tiga item operasional, PPN 11%, dan jatuh tempo dalam dua minggu sehingga siap masuk review payable.',
          nominalAmount: 1748000,
          currency: 'IDR',
          effectiveDate: '2026-07-22',
          expiryDate: '2026-08-09',
          parties: [
            { name: 'PT Sumber Niaga Prima', role: 'Issuer' },
            { name: 'NovaERP Demo Company', role: 'Paying Entity' },
          ],
          deadlines: [
            { title: 'AP review cutoff', date: '2026-07-29', owner: 'Accountant' },
            { title: 'Payment due date', date: '2026-08-09', owner: 'Treasury Officer' },
          ],
          risks: [
            {
              title: 'Duplicate invoice risk if receipt evidence is uploaded separately',
              severity: 'MEDIUM' as const,
              rationale:
                'Receipt and invoice references are close enough to require matching review.',
            },
          ],
          extractedSignals: ['Vendor tax context', 'Due date', 'Three payable line items'],
          recommendedActions: [
            'Match invoice against goods receipt before posting the payable.',
            'Queue payment planning before August 9, 2026 to avoid overdue status.',
          ],
        };
    }
  }
}
