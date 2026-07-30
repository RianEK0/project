import { Module } from '@nestjs/common';

import { CustomerTimelineController } from './customer-timeline.controller';
import { CustomerTimelineService } from './customer-timeline.service';

@Module({
  controllers: [CustomerTimelineController],
  providers: [CustomerTimelineService],
})
export class CustomerTimelineModule {}
