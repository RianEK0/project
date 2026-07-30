import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { vendorComparisonStatuses } from '@nova/shared-types';

import {
  VendorComparisonService,
  type SupplierQuotationCandidate,
  type VendorComparisonWeights,
} from './vendor-comparison.service';

type ComparisonPreviewBody = {
  quotations: SupplierQuotationCandidate[];
  weights?: Partial<VendorComparisonWeights>;
};

@ApiTags('Vendor Comparisons')
@Controller({
  path: 'vendor-comparisons',
  version: '1',
})
export class VendorComparisonsController {
  constructor(private readonly vendorComparisonService: VendorComparisonService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: vendorComparisonStatuses,
    };
  }

  @Post('preview')
  preview(@Body() body: ComparisonPreviewBody) {
    return this.vendorComparisonService.compare(body.quotations, body.weights);
  }
}
