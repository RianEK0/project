import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { automationRunStatuses } from '@nova/shared-types';

import { CronSchedulePreviewService } from './cron-schedule-preview.service';

@ApiTags('Cron Jobs')
@Controller({
  path: 'cron-jobs',
  version: '1',
})
export class CronJobsController {
  constructor(private readonly cronSchedulePreviewService: CronSchedulePreviewService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      frequencies: this.cronSchedulePreviewService.getFrequencies(),
      runStatuses: automationRunStatuses,
      timezones: ['UTC', 'Asia/Jakarta', 'America/New_York'],
    };
  }

  @Get('schedule-preview')
  getSchedulePreview() {
    return this.cronSchedulePreviewService.previewSchedule({
      frequency: 'CUSTOM',
      anchorAt: '2026-07-24T00:00:00.000Z',
      everyMinutes: 15,
      occurrences: 4,
    });
  }
}
