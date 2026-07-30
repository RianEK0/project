import { Module } from '@nestjs/common';

import { AvailabilityOverlapService } from './availability-overlap.service';

@Module({
  providers: [AvailabilityOverlapService],
  exports: [AvailabilityOverlapService],
})
export class AvailabilityModule {}
