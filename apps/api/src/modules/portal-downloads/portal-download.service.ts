import { HttpStatus, Injectable } from '@nestjs/common';
import {
  downloadAssetStatuses,
  downloadAssetTypes,
  type DownloadAssetStatus,
  type DownloadAssetType,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type DownloadAsset = {
  id: string;
  title: string;
  documentType: DownloadAssetType;
  status: DownloadAssetStatus;
  route: string;
  generatedAt: string;
};

const sampleAssets: DownloadAsset[] = [
  {
    id: 'asset-invoice-pdf',
    title: 'Invoice INV-2026-00431',
    documentType: 'INVOICE_PDF',
    status: 'AVAILABLE',
    route: '/portal/invoices/INV-2026-00431',
    generatedAt: '2026-07-21T10:20:00.000Z',
  },
  {
    id: 'asset-booking-voucher',
    title: 'Booking voucher BKG-2026-00024',
    documentType: 'BOOKING_VOUCHER',
    status: 'AVAILABLE',
    route: '/portal/bookings/BKG-2026-00024',
    generatedAt: '2026-07-19T09:05:00.000Z',
  },
  {
    id: 'asset-proof',
    title: 'Proof of delivery SHP-2026-00044',
    documentType: 'DELIVERY_PROOF',
    status: 'GENERATING',
    route: '/portal/tracking/SHP-2026-00044',
    generatedAt: '2026-07-23T08:30:00.000Z',
  },
];

@Injectable()
export class PortalDownloadService {
  getAssetTypes(): DownloadAssetType[] {
    return [...downloadAssetTypes];
  }

  getStatuses(): DownloadAssetStatus[] {
    return [...downloadAssetStatuses];
  }

  getCatalog(): DownloadAsset[] {
    return sampleAssets;
  }

  getAvailableAssets(): DownloadAsset[] {
    return sampleAssets.filter((asset) => asset.status === 'AVAILABLE');
  }

  assertAssetAvailable(status: DownloadAssetStatus): void {
    if (status !== 'AVAILABLE') {
      throw new AppException(
        ERROR_CODES.DOWNLOAD_ASSET_NOT_FOUND,
        `Download asset with status ${status} is not ready to be downloaded.`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
