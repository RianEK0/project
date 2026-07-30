import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { salesPipelineStages } from '@nova/shared-types';

@ApiTags('Sales Funnel')
@Controller({
  path: 'sales-funnel',
  version: '1',
})
export class SalesFunnelController {
  @Get()
  getFoundation() {
    return {
      stages: salesPipelineStages,
      focus: 'Lead-to-win conversion path',
    };
  }
}
