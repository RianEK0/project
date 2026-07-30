import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { vendorLeadTimeTrends, vendorRatingLevels } from '@nova/shared-types';

import {
  VendorPerformanceService,
  type VendorPerformanceReceipt,
} from './vendor-performance.service';

type VendorPerformanceEvaluationBody = {
  receipts: VendorPerformanceReceipt[];
  previousAverageLeadTimeDays?: number | string;
};

@ApiTags('Vendor Performance')
@Controller({
  path: 'vendor-performance',
  version: '1',
})
export class VendorPerformanceController {
  constructor(private readonly vendorPerformanceService: VendorPerformanceService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      ratingLevels: vendorRatingLevels,
      leadTimeTrends: vendorLeadTimeTrends,
    };
  }

  @Post('evaluate')
  evaluate(@Body() body: VendorPerformanceEvaluationBody) {
    return this.vendorPerformanceService.evaluate(body.receipts, body.previousAverageLeadTimeDays);
  }
}
