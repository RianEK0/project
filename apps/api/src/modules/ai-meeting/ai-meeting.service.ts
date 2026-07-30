import { HttpStatus, Injectable } from '@nestjs/common';
import {
  aiMeetingArtifactStatuses,
  aiMeetingTypes,
  aiRequestStatuses,
  type AiMeetingArtifactStatus,
  type AiMeetingType,
  type AiRequestStatus,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

const acceptedMimeTypes = [
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/x-m4a',
  'audio/wav',
] as const;

type UploadedMeetingInput = {
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  meetingType?: string;
};

type MeetingParticipant = {
  name: string;
  role: string;
};

type MeetingDecision = {
  title: string;
  rationale: string;
};

type MeetingActionItem = {
  title: string;
  pic: string;
  deadline: string;
  status: 'OPEN';
};

export type AiMeetingFoundation = {
  items: unknown[];
  statuses: readonly AiRequestStatus[];
  meetingTypes: readonly AiMeetingType[];
  artifactStatuses: readonly AiMeetingArtifactStatus[];
  acceptedMimeTypes: readonly string[];
  outputSections: string[];
  supportedLanguages: string[];
};

export type AiMeetingSummary = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  meetingType: AiMeetingType;
  requestStatus: AiRequestStatus;
  artifactStatus: AiMeetingArtifactStatus;
  language: string;
  summary: string;
  participants: MeetingParticipant[];
  decisions: MeetingDecision[];
  actionItems: MeetingActionItem[];
  followUpRoutes: string[];
};

@Injectable()
export class AiMeetingService {
  getFoundation(): AiMeetingFoundation {
    return {
      items: [],
      statuses: aiRequestStatuses,
      meetingTypes: aiMeetingTypes,
      artifactStatuses: aiMeetingArtifactStatuses,
      acceptedMimeTypes,
      outputSections: ['Summary', 'Action Item', 'Decision', 'Deadline', 'PIC'],
      supportedLanguages: ['id-ID', 'en-US'],
    };
  }

  summarize(input: UploadedMeetingInput): AiMeetingSummary {
    const fileName = input.fileName?.trim();
    const mimeType = input.mimeType?.trim();
    const sizeBytes = input.sizeBytes ?? 0;

    if (!fileName || !mimeType || sizeBytes <= 0) {
      throw new AppException(
        ERROR_CODES.AI_MEETING_FILE_REQUIRED,
        'An audio file is required for AI Meeting summarization.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!acceptedMimeTypes.includes(mimeType as (typeof acceptedMimeTypes)[number])) {
      throw new AppException(
        ERROR_CODES.AI_MEETING_FILE_TYPE_UNSUPPORTED,
        `Unsupported AI Meeting file type: ${mimeType}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const meetingType = this.resolveMeetingType(fileName, input.meetingType);
    const scenario = this.buildScenario(meetingType);

    return {
      fileName,
      mimeType,
      sizeBytes,
      meetingType,
      requestStatus: 'COMPLETED',
      artifactStatus: scenario.artifactStatus,
      language: 'id-ID',
      summary: scenario.summary,
      participants: scenario.participants,
      decisions: scenario.decisions,
      actionItems: scenario.actionItems,
      followUpRoutes: scenario.followUpRoutes,
    };
  }

  private resolveMeetingType(fileName: string, meetingType?: string): AiMeetingType {
    if (meetingType) {
      if (!aiMeetingTypes.includes(meetingType as AiMeetingType)) {
        throw new AppException(
          ERROR_CODES.AI_MEETING_INPUT_INVALID,
          `Unsupported AI Meeting type: ${meetingType}.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      return meetingType as AiMeetingType;
    }

    const normalized = fileName.toLowerCase();

    if (normalized.includes('sales')) {
      return 'SALES_SYNC';
    }
    if (normalized.includes('warehouse') || normalized.includes('ops')) {
      return 'OPERATIONS_STANDUP';
    }
    if (normalized.includes('exec') || normalized.includes('board')) {
      return 'EXECUTIVE_SYNC';
    }

    return 'PROCUREMENT_REVIEW';
  }

  private buildScenario(meetingType: AiMeetingType) {
    switch (meetingType) {
      case 'PROCUREMENT_REVIEW':
        return {
          artifactStatus: 'READY_TO_SHARE' as const,
          summary:
            'Meeting procurement membahas backlog purchase order, risiko lead time supplier ABC, dan kebutuhan percepatan inbound untuk minggu terakhir Juli 2026.',
          participants: [
            { name: 'Nadia Putri', role: 'Procurement Manager' },
            { name: 'Rian Mahendra', role: 'Warehouse Supervisor' },
            { name: 'Dimas Kurnia', role: 'Finance Controller' },
          ],
          decisions: [
            {
              title:
                'Supplier ABC tetap dipakai untuk order 50 unit dengan jadwal kirim dipercepat',
              rationale:
                'Lead time terbaik masih dimiliki supplier ini walaupun perlu konfirmasi armada.',
            },
            {
              title: 'Invoice matching akan dipantau harian untuk PO prioritas akhir Juli',
              rationale:
                'Finance ingin menghindari keterlambatan invoice preparation di penutupan bulan.',
            },
          ],
          actionItems: [
            {
              title: 'Kirim konfirmasi kapasitas kirim ke Supplier ABC',
              pic: 'Nadia Putri',
              deadline: '2026-07-27',
              status: 'OPEN' as const,
            },
            {
              title: 'Siapkan receiving window untuk inbound prioritas',
              pic: 'Rian Mahendra',
              deadline: '2026-07-28',
              status: 'OPEN' as const,
            },
            {
              title: 'Review invoice preparation queue untuk PO prioritas',
              pic: 'Dimas Kurnia',
              deadline: '2026-07-29',
              status: 'OPEN' as const,
            },
          ],
          followUpRoutes: [
            '/app/procurement/orders',
            '/app/procurement/invoice-preparation',
            '/app/automation/reminders',
          ],
        };
      case 'SALES_SYNC':
        return {
          artifactStatus: 'READY_TO_SHARE' as const,
          summary:
            'Sales sync menyoroti tiga opportunity besar, risiko keterlambatan delivery order, dan kebutuhan follow-up collection untuk dua invoice jatuh tempo minggu ini.',
          participants: [
            { name: 'Alya Rahman', role: 'Sales Lead' },
            { name: 'Kevin Pratama', role: 'Account Executive' },
            { name: 'Rini Kartika', role: 'Collections Officer' },
          ],
          decisions: [
            {
              title: 'Opportunity PT Sentra Retail diprioritaskan untuk quotation final',
              rationale:
                'Deal value tertinggi dan closing window paling dekat pada akhir Juli 2026.',
            },
          ],
          actionItems: [
            {
              title: 'Kirim quotation final ke PT Sentra Retail',
              pic: 'Kevin Pratama',
              deadline: '2026-07-27',
              status: 'OPEN' as const,
            },
            {
              title: 'Hubungi customer yang invoice-nya jatuh tempo minggu ini',
              pic: 'Rini Kartika',
              deadline: '2026-07-28',
              status: 'OPEN' as const,
            },
          ],
          followUpRoutes: ['/app/crm/quotations', '/app/sales/invoices', '/app/crm/tasks'],
        };
      case 'OPERATIONS_STANDUP':
        return {
          artifactStatus: 'REVIEW_NEEDED' as const,
          summary:
            'Operations standup membahas congestion di Aisle 4, backlog picking wave pagi, dan kepatuhan PPE shift pertama yang perlu ditingkatkan.',
          participants: [
            { name: 'Bagas Hendra', role: 'Operations Manager' },
            { name: 'Sinta Permata', role: 'Safety Officer' },
            { name: 'Yoga Prasetyo', role: 'Picking Coordinator' },
          ],
          decisions: [
            {
              title: 'Cycle count Aisle 4 dijalankan ulang setelah area inbound dilonggarkan',
              rationale: 'Forklift menutupi pallet sehingga hasil scan pagi belum cukup akurat.',
            },
          ],
          actionItems: [
            {
              title: 'Bersihkan buffer inbound di Aisle 4',
              pic: 'Yoga Prasetyo',
              deadline: '2026-07-27',
              status: 'OPEN' as const,
            },
            {
              title: 'Jalankan inspeksi PPE ulang untuk shift siang',
              pic: 'Sinta Permata',
              deadline: '2026-07-27',
              status: 'OPEN' as const,
            },
          ],
          followUpRoutes: [
            '/app/warehouse-operations/dashboard',
            '/app/ai/vision',
            '/app/automation/reminders',
          ],
        };
      case 'EXECUTIVE_SYNC':
        return {
          artifactStatus: 'READY_TO_SHARE' as const,
          summary:
            'Executive sync merangkum cash-flow exposure akhir bulan, percepatan purchase order kritis, dan kebutuhan dashboard exception untuk operasional cabang.',
          participants: [
            { name: 'Mira Anggraini', role: 'CEO' },
            { name: 'Farhan Yusuf', role: 'Finance Director' },
            { name: 'Dewi Lestari', role: 'Operations Director' },
          ],
          decisions: [
            {
              title: 'Direksi menyetujui monitoring harian cash-flow hingga Jumat, July 31, 2026',
              rationale:
                'Eksposur pembayaran supplier dan collection customer sedang tinggi di pekan penutupan bulan.',
            },
          ],
          actionItems: [
            {
              title: 'Publikasikan executive dashboard exception pack',
              pic: 'Farhan Yusuf',
              deadline: '2026-07-28',
              status: 'OPEN' as const,
            },
            {
              title: 'Validasi PO kritis yang perlu approval director',
              pic: 'Dewi Lestari',
              deadline: '2026-07-27',
              status: 'OPEN' as const,
            },
          ],
          followUpRoutes: [
            '/app/dashboards',
            '/app/finance/cash-flow',
            '/app/procurement/approvals',
          ],
        };
    }
  }
}
