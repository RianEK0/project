import { Module } from '@nestjs/common';

import { VendorPerformanceService } from './vendor-performance.service';
import { VendorPerformanceController } from './vendor-performance.controller';

@Module({
  controllers: [VendorPerformanceController],
  providers: [VendorPerformanceService],
  exports: [VendorPerformanceService],
})
export class VendorPerformanceModule {}
