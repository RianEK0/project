import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PortalDownloadService } from './portal-download.service';

@ApiTags('Portal Downloads')
@Controller({
  path: 'portal-downloads',
  version: '1',
})
export class PortalDownloadsController {
  constructor(private readonly portalDownloadService: PortalDownloadService) {}

  @Get()
  getCatalog() {
    return {
      assetTypes: this.portalDownloadService.getAssetTypes(),
      statuses: this.portalDownloadService.getStatuses(),
      availableCount: this.portalDownloadService.getAvailableAssets().length,
      items: this.portalDownloadService.getCatalog(),
    };
  }
}
