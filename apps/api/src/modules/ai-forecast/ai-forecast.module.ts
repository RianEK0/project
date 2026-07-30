import { Module } from '@nestjs/common';

import { AiForecastController } from './ai-forecast.controller';
import { AiForecastSignalService } from './ai-forecast-signal.service';

@Module({
  controllers: [AiForecastController],
  providers: [AiForecastSignalService],
})
export class AiForecastModule {}
