import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { packingSessionStatuses } from '@nova/shared-types';

@ApiTags('Packing')
@Controller({
  path: 'packing-sessions',
  version: '1',
})
export class PackingController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: packingSessionStatuses,
    };
  }
}
