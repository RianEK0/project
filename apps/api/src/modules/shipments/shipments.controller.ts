import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { shipmentStatuses } from '@nova/shared-types';

@ApiTags('Shipments')
@Controller({
  path: 'shipments',
  version: '1',
})
export class ShipmentsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: shipmentStatuses,
      proofOfDelivery: true,
    };
  }
}
