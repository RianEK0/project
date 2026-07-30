import { Module } from '@nestjs/common';

import { WarehouseScanResolutionService } from './warehouse-scan-resolution.service';
import { WarehouseScanningController } from './warehouse-scanning.controller';

@Module({
  controllers: [WarehouseScanningController],
  providers: [WarehouseScanResolutionService],
  exports: [WarehouseScanResolutionService],
})
export class WarehouseScanningModule {}
