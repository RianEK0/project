import { Module } from '@nestjs/common';

import { MobileOfflineSyncService } from './mobile-offline-sync.service';
import { MobilePwaReadinessService } from './mobile-pwa-readiness.service';
import { MobileWarehouseUiService } from './mobile-warehouse-ui.service';
import { MobileWorkspaceController } from './mobile-workspace.controller';

@Module({
  controllers: [MobileWorkspaceController],
  providers: [MobilePwaReadinessService, MobileOfflineSyncService, MobileWarehouseUiService],
})
export class MobileWorkspaceModule {}
