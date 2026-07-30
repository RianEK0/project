import { HttpStatus, Injectable } from '@nestjs/common';
import { type ScanType } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type ScanEntityType =
  | 'product'
  | 'productVariant'
  | 'productBarcode'
  | 'inventorySerial'
  | 'inventoryLot'
  | 'warehouse'
  | 'storageLocation'
  | 'document'
  | 'package';

export type ScanResolution = {
  scanType: ScanType;
  entityType: ScanEntityType;
  value: string;
  normalizedCode: string;
};

const prefixMap = {
  PRD: {
    scanType: 'PRODUCT',
    entityType: 'product',
  },
  SKU: {
    scanType: 'VARIANT',
    entityType: 'productVariant',
  },
  BC: {
    scanType: 'BARCODE',
    entityType: 'productBarcode',
  },
  SER: {
    scanType: 'SERIAL',
    entityType: 'inventorySerial',
  },
  LOT: {
    scanType: 'LOT',
    entityType: 'inventoryLot',
  },
  WH: {
    scanType: 'WAREHOUSE',
    entityType: 'warehouse',
  },
  LOC: {
    scanType: 'STORAGE_LOCATION',
    entityType: 'storageLocation',
  },
  DOC: {
    scanType: 'DOCUMENT',
    entityType: 'document',
  },
  PKG: {
    scanType: 'PACKAGE',
    entityType: 'package',
  },
} as const satisfies Record<
  string,
  {
    scanType: ScanType;
    entityType: ScanEntityType;
  }
>;

@Injectable()
export class WarehouseScanResolutionService {
  getSupportedPrefixes(): string[] {
    return Object.keys(prefixMap);
  }

  resolve(code: string): ScanResolution {
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      throw new AppException(
        ERROR_CODES.SCAN_CODE_NOT_FOUND,
        'Scanned code cannot be empty.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (/^\d{8,18}$/.test(trimmedCode)) {
      return {
        scanType: 'BARCODE',
        entityType: 'productBarcode',
        value: trimmedCode,
        normalizedCode: trimmedCode,
      };
    }

    const separatorIndex = trimmedCode.indexOf(':');

    if (separatorIndex === -1) {
      throw new AppException(
        ERROR_CODES.SCAN_CODE_NOT_FOUND,
        `Scanned code ${trimmedCode} is not recognized by the warehouse scanner.`,
        HttpStatus.NOT_FOUND,
      );
    }

    const normalizedPrefix = trimmedCode.slice(0, separatorIndex).toUpperCase();
    const definition = prefixMap[normalizedPrefix as keyof typeof prefixMap];
    const value = trimmedCode.slice(separatorIndex + 1).trim();

    if (!definition || !value) {
      throw new AppException(
        ERROR_CODES.SCAN_CODE_NOT_FOUND,
        `Scanned code ${trimmedCode} is not recognized by the warehouse scanner.`,
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      ...definition,
      value,
      normalizedCode: `${normalizedPrefix}:${value}`,
    };
  }
}
