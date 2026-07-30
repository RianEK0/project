import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { bookingSources, bookingStatuses } from '@nova/shared-types';

@ApiTags('Portal Bookings')
@Controller({
  path: 'portal-bookings',
  version: '1',
})
export class PortalBookingsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: bookingStatuses,
      sources: bookingSources,
      selfServiceActions: ['VIEW', 'RESCHEDULE_REQUEST', 'CANCEL_REQUEST'],
    };
  }
}
