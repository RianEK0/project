import { Module } from '@nestjs/common';

import { BookingStatusTransitionService } from './booking-status-transition.service';

@Module({
  providers: [BookingStatusTransitionService],
  exports: [BookingStatusTransitionService],
})
export class BookingsModule {}
