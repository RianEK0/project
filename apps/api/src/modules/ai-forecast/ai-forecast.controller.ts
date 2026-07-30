import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AiForecastSignalService } from './ai-forecast-signal.service';

@ApiTags('AI Forecast')
@Controller({
  path: 'ai-forecast',
  version: '1',
})
export class AiForecastController {
  constructor(private readonly aiForecastSignalService: AiForecastSignalService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: this.aiForecastSignalService.getStatuses(),
      horizons: this.aiForecastSignalService.getHorizons(),
      modelModes: this.aiForecastSignalService.getModelModes(),
      measures: ['Revenue', 'Open exposure', 'Backorder units', 'Attendance risk'],
    };
  }

  @Get('preview')
  getPreview() {
    return this.aiForecastSignalService.previewForecast({
      metric: 'Open purchase exposure',
      horizon: '30_DAYS',
      history: [120, 130, 150, 165],
    });
  }
}
