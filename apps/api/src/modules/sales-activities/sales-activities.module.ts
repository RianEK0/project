import { Module } from '@nestjs/common';

import { CallLogsController } from './call-logs.controller';
import { SalesActivitiesController } from './sales-activities.controller';

@Module({
  controllers: [SalesActivitiesController, CallLogsController],
})
export class SalesActivitiesModule {}
