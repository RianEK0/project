import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { customerTimelineEventTypes } from '@nova/shared-types';

import {
  CustomerTimelineService,
  type CustomerTimelineInputEntry,
} from './customer-timeline.service';

@ApiTags('Customer Timeline')
@Controller({
  path: 'customer-timeline',
  version: '1',
})
export class CustomerTimelineController {
  constructor(private readonly customerTimelineService: CustomerTimelineService) {}

  @Get()
  getFoundation() {
    return {
      items: [],
      eventTypes: customerTimelineEventTypes,
    };
  }

  @Post('preview')
  preview(@Body() body: { entries: CustomerTimelineInputEntry[] }) {
    return this.customerTimelineService.compose(body.entries ?? []);
  }
}
