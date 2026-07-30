import { HttpStatus, Injectable } from '@nestjs/common';
import {
  aiDocumentConfidenceBands,
  aiRequestStatuses,
  aiVisionDetectionTypes,
  aiVisionResultStatuses,
  aiVisionScanModes,
  type AiDocumentConfidenceBand,
  type AiRequestStatus,
  type AiVisionDetectionType,
  type AiVisionResultStatus,
  type AiVisionScanMode,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

const acceptedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'] as const;

type UploadedVisionInput = {
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  scanMode?: string;
};

type VisionDetection = {
  type: AiVisionDetectionType;
  label: string;
  value: string;
  confidencePct: number;
};

type VisionCountedItem = {
  sku: string;
  productName: string;
  detectedQuantity: number;
  barcode: string;
  lot: string | null;
  serial: string | null;
};

type VisionPpeCheck = {
  label: string;
  detected: boolean;
};

type VisionAttendanceMatch = {
  employeeId: string;
  employeeName: string;
  department: string;
  shift: string;
  attendanceMarkedAt: string;
};

export type AiVisionFoundation = {
  items: unknown[];
  statuses: readonly AiRequestStatus[];
  scanModes: readonly AiVisionScanMode[];
  detectionTypes: readonly AiVisionDetectionType[];
  resultStatuses: readonly AiVisionResultStatus[];
  confidenceBands: readonly AiDocumentConfidenceBand[];
  acceptedMimeTypes: readonly string[];
  supportedDevices: string[];
  outputSignals: string[];
};

export type AiVisionScanResult = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  scanMode: AiVisionScanMode;
  requestStatus: AiRequestStatus;
  resultStatus: AiVisionResultStatus;
  confidenceBand: AiDocumentConfidenceBand;
  confidencePct: number;
  capturedAt: string;
  site: string;
  summary: string;
  detections: VisionDetection[];
  countedItems: VisionCountedItem[];
  attendanceMatch: VisionAttendanceMatch | null;
  ppeChecks: VisionPpeCheck[];
  recommendedActions: string[];
};

@Injectable()
export class AiVisionService {
  getFoundation(): AiVisionFoundation {
    return {
      items: [],
      statuses: aiRequestStatuses,
      scanModes: aiVisionScanModes,
      detectionTypes: aiVisionDetectionTypes,
      resultStatuses: aiVisionResultStatuses,
      confidenceBands: aiDocumentConfidenceBands,
      acceptedMimeTypes,
      supportedDevices: ['Phone Camera', 'Tablet Camera', 'Warehouse Handheld'],
      outputSignals: ['Lokasi', 'Produk', 'Jumlah', 'Barcode', 'QR', 'Lot', 'Serial', 'PPE'],
    };
  }

  scan(input: UploadedVisionInput): AiVisionScanResult {
    const fileName = input.fileName?.trim();
    const mimeType = input.mimeType?.trim();
    const sizeBytes = input.sizeBytes ?? 0;

    if (!fileName || !mimeType || sizeBytes <= 0) {
      throw new AppException(
        ERROR_CODES.AI_VISION_FILE_REQUIRED,
        'An image capture is required for AI Vision scanning.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!acceptedMimeTypes.includes(mimeType as (typeof acceptedMimeTypes)[number])) {
      throw new AppException(
        ERROR_CODES.AI_VISION_FILE_TYPE_UNSUPPORTED,
        `Unsupported AI Vision file type: ${mimeType}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const scanMode = this.resolveScanMode(fileName, input.scanMode);
    const scenario = this.buildScenario(scanMode);
    const confidenceBand = this.resolveConfidenceBand(scenario.confidencePct);

    return {
      fileName,
      mimeType,
      sizeBytes,
      scanMode,
      requestStatus: 'COMPLETED',
      resultStatus: scenario.resultStatus,
      confidenceBand,
      confidencePct: scenario.confidencePct,
      capturedAt: scenario.capturedAt,
      site: scenario.site,
      summary: scenario.summary,
      detections: scenario.detections,
      countedItems: scenario.countedItems,
      attendanceMatch: scenario.attendanceMatch,
      ppeChecks: scenario.ppeChecks,
      recommendedActions: scenario.recommendedActions,
    };
  }

  private resolveScanMode(fileName: string, scanMode?: string): AiVisionScanMode {
    if (scanMode) {
      if (!aiVisionScanModes.includes(scanMode as AiVisionScanMode)) {
        throw new AppException(
          ERROR_CODES.AI_VISION_INPUT_INVALID,
          `Unsupported AI Vision scan mode: ${scanMode}.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      return scanMode as AiVisionScanMode;
    }

    const normalized = fileName.toLowerCase();

    if (normalized.includes('ppe')) {
      return 'PPE';
    }
    if (normalized.includes('face') || normalized.includes('attendance')) {
      return 'FACE_ATTENDANCE';
    }
    if (normalized.includes('warehouse') || normalized.includes('aisle')) {
      return 'WAREHOUSE';
    }

    return 'RACK';
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

  private buildScenario(scanMode: AiVisionScanMode) {
    switch (scanMode) {
      case 'RACK':
        return {
          resultStatus: 'MATCHED' as const,
          confidencePct: 92,
          capturedAt: '2026-07-26T09:12:00+07:00',
          site: 'WH-JKT-A / Rack R-12-B-03',
          summary:
            'AI mengidentifikasi lokasi rack, SKU utama, barcode, QR, lot, serial, dan kuantitas terlihat dari satu frame kamera.',
          detections: [
            { type: 'LOCATION' as const, label: 'Lokasi', value: 'R-12-B-03', confidencePct: 97 },
            {
              type: 'PRODUCT' as const,
              label: 'Produk',
              value: 'Sealant Cartridge 300 ml',
              confidencePct: 94,
            },
            { type: 'QUANTITY' as const, label: 'Jumlah', value: '24 unit', confidencePct: 90 },
            {
              type: 'BARCODE' as const,
              label: 'Barcode',
              value: '8998800112233',
              confidencePct: 96,
            },
            { type: 'QR' as const, label: 'QR', value: 'R12B03-SEALANT', confidencePct: 91 },
            { type: 'LOT' as const, label: 'Lot', value: 'LOT-24-07A', confidencePct: 89 },
            {
              type: 'SERIAL' as const,
              label: 'Serial',
              value: 'SN-R12B03-00024',
              confidencePct: 87,
            },
          ],
          countedItems: [
            {
              sku: 'SEAL-300',
              productName: 'Sealant Cartridge 300 ml',
              detectedQuantity: 24,
              barcode: '8998800112233',
              lot: 'LOT-24-07A',
              serial: 'SN-R12B03-00024',
            },
          ],
          attendanceMatch: null,
          ppeChecks: [],
          recommendedActions: [
            'Post the rack reconciliation into warehouse cycle count draft if the operator confirms the 24-unit count.',
            'Attach the rack image to the inventory location audit trail for Sunday, July 26, 2026.',
          ],
        };
      case 'WAREHOUSE':
        return {
          resultStatus: 'REVIEW_NEEDED' as const,
          confidencePct: 84,
          capturedAt: '2026-07-26T10:08:00+07:00',
          site: 'WH-JKT-A / Aisle 4 Inbound Buffer',
          summary:
            'AI menghitung stok terlihat pada area gudang dan menandai satu SKU yang tertutup forklift sehingga butuh review supervisor.',
          detections: [
            { type: 'LOCATION' as const, label: 'Lokasi', value: 'Aisle 4', confidencePct: 95 },
            {
              type: 'PRODUCT' as const,
              label: 'Produk Dominan',
              value: 'Fastener Box M8',
              confidencePct: 88,
            },
            {
              type: 'QUANTITY' as const,
              label: 'Total Terlihat',
              value: '148 unit',
              confidencePct: 82,
            },
            {
              type: 'BARCODE' as const,
              label: 'Barcode Terbaca',
              value: '3 barcode, 1 occluded',
              confidencePct: 79,
            },
          ],
          countedItems: [
            {
              sku: 'FAST-M8',
              productName: 'Fastener Box M8',
              detectedQuantity: 80,
              barcode: '8890001001123',
              lot: 'LOT-M8-2407',
              serial: null,
            },
            {
              sku: 'GASKET-ROLL',
              productName: 'Safety Gasket Roll',
              detectedQuantity: 36,
              barcode: '8890001002257',
              lot: 'LOT-GS-2407',
              serial: null,
            },
            {
              sku: 'LABEL-THERMAL',
              productName: 'Thermal Barcode Label',
              detectedQuantity: 32,
              barcode: '8890001007781',
              lot: null,
              serial: null,
            },
          ],
          attendanceMatch: null,
          ppeChecks: [],
          recommendedActions: [
            'Review the occluded pallet in Aisle 4 before posting the warehouse count to inventory.',
            'Open a cycle count exception for the hidden SKU on Monday, July 27, 2026.',
          ],
        };
      case 'FACE_ATTENDANCE':
        return {
          resultStatus: 'MATCHED' as const,
          confidencePct: 90,
          capturedAt: '2026-07-26T07:31:00+07:00',
          site: 'Plant 1 / Gate Timur',
          summary:
            'AI mencocokkan wajah karyawan dan menyiapkan absensi masuk lengkap dengan shift dan departemen.',
          detections: [
            {
              type: 'FACE' as const,
              label: 'Face Match',
              value: 'Raka Saputra',
              confidencePct: 93,
            },
            { type: 'LOCATION' as const, label: 'Gate', value: 'Gate Timur', confidencePct: 95 },
          ],
          countedItems: [],
          attendanceMatch: {
            employeeId: 'EMP-0142',
            employeeName: 'Raka Saputra',
            department: 'Warehouse Operations',
            shift: 'Shift A',
            attendanceMarkedAt: '2026-07-26T07:31:00+07:00',
          },
          ppeChecks: [],
          recommendedActions: [
            'Mark attendance check-in for Shift A and push the event into the attendance review queue.',
            'Retain the face-match evidence under HR attendance governance for Sunday, July 26, 2026.',
          ],
        };
      case 'PPE':
        return {
          resultStatus: 'ALERT' as const,
          confidencePct: 86,
          capturedAt: '2026-07-26T11:18:00+07:00',
          site: 'Production Line 2 / Safety Checkpoint',
          summary:
            'AI mendeteksi helm, rompi, dan sepatu keselamatan, tetapi masker tidak terlihat jelas sehingga perlu intervensi supervisor.',
          detections: [
            { type: 'HELMET' as const, label: 'Helm', value: 'Detected', confidencePct: 94 },
            { type: 'MASK' as const, label: 'Masker', value: 'Not detected', confidencePct: 72 },
            {
              type: 'SAFETY_SHOES' as const,
              label: 'Sepatu',
              value: 'Detected',
              confidencePct: 89,
            },
            { type: 'VEST' as const, label: 'Rompi', value: 'Detected', confidencePct: 92 },
          ],
          countedItems: [],
          attendanceMatch: null,
          ppeChecks: [
            { label: 'Helm', detected: true },
            { label: 'Masker', detected: false },
            { label: 'Sepatu', detected: true },
            { label: 'Rompi', detected: true },
          ],
          recommendedActions: [
            'Create a PPE compliance alert for the line supervisor with the missing mask evidence.',
            'Schedule a repeat safety scan on Monday, July 27, 2026 before the next production shift starts.',
          ],
        };
    }
  }
}
