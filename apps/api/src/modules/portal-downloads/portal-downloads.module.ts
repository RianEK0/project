import { Module } from '@nestjs/common';

import { PortalDownloadService } from './portal-download.service';
import { PortalDownloadsController } from './portal-downloads.controller';

@Module({
  controllers: [PortalDownloadsController],
  providers: [PortalDownloadService],
})
export class PortalDownloadsModule {}
