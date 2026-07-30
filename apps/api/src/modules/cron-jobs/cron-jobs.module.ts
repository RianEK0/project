import { Module } from '@nestjs/common';

import { CronJobsController } from './cron-jobs.controller';
import { CronSchedulePreviewService } from './cron-schedule-preview.service';

@Module({
  controllers: [CronJobsController],
  providers: [CronSchedulePreviewService],
})
export class CronJobsModule {}
