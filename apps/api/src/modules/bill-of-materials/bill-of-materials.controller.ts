import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { billOfMaterialStatuses, bomLineTypes } from '@nova/shared-types';

import { BomExplosionService } from './bom-explosion.service';

@ApiTags('Bill Of Materials')
@Controller({
  path: 'bill-of-materials',
  version: '1',
})
export class BillOfMaterialsController {
  constructor(private readonly bomExplosionService: BomExplosionService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: billOfMaterialStatuses,
      lineTypes: bomLineTypes,
      revisionControls: this.bomExplosionService.getRevisionControls(),
    };
  }

  @Get('explosion-preview')
  getExplosionPreview() {
    return this.bomExplosionService.summarizeExplosion(
      [
        {
          componentCode: 'FRAME-KIT',
          quantityPer: 2,
          lineType: 'SUBASSEMBLY',
          children: [
            { componentCode: 'STEEL-PLATE', quantityPer: 3, lineType: 'COMPONENT' },
            { componentCode: 'BOLT-M8', quantityPer: 8, lineType: 'COMPONENT' },
          ],
        },
        { componentCode: 'PAINT-ORANGE', quantityPer: 1.5, lineType: 'CONSUMABLE' },
      ],
      10,
    );
  }
}
