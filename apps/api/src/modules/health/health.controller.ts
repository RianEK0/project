import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from '@/common/decorators/public.decorator';

import { HealthService } from './health.service';

@ApiTags('Health')
@Controller({
  path: 'health',
  version: '1',
})
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  getHealth() {
    return this.healthService.getHealth();
  }

  @Public()
  @Get('live')
  getLiveness() {
    return this.healthService.getLiveness();
  }

  @Public()
  @Get('ready')
  async getReadiness() {
    return this.healthService.getReadiness();
  }
}

