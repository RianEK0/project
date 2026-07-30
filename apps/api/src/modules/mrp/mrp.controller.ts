import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { MrpNetRequirementService } from './mrp-net-requirement.service';

@ApiTags('MRP')
@Controller({
  path: 'mrp',
  version: '1',
})
export class MrpController {
  constructor(private readonly mrpNetRequirementService: MrpNetRequirementService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: this.mrpNetRequirementService.getStatuses(),
      exceptionTypes: this.mrpNetRequirementService.getExceptionTypes(),
      supplySources: this.mrpNetRequirementService.getSupplySources(),
    };
  }

  @Get('net-requirement-preview')
  getNetRequirementPreview() {
    return this.mrpNetRequirementService.previewRequirement({
      itemCode: 'MOTOR-220V',
      grossRequirement: 180,
      onHand: 40,
      scheduledReceipts: 20,
      safetyStock: 10,
      lotSize: 50,
    });
  }
}
