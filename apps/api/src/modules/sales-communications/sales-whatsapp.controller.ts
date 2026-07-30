import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { salesCommunicationStatuses } from '@nova/shared-types';

@ApiTags('Sales WhatsApp')
@Controller({
  path: 'sales-whatsapp',
  version: '1',
})
export class SalesWhatsappController {
  @Get()
  listFoundation() {
    return {
      items: [],
      channel: 'WHATSAPP',
      statuses: salesCommunicationStatuses,
    };
  }
}
