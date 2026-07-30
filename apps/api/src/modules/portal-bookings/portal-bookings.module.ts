import { Module } from '@nestjs/common';

import { PortalBookingsController } from './portal-bookings.controller';

@Module({
  controllers: [PortalBookingsController],
})
export class PortalBookingsModule {}
