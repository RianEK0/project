import { Module } from '@nestjs/common';

import { VendorComparisonService } from './vendor-comparison.service';
import { VendorComparisonsController } from './vendor-comparisons.controller';

@Module({
  controllers: [VendorComparisonsController],
  providers: [VendorComparisonService],
  exports: [VendorComparisonService],
})
export class VendorComparisonsModule {}
