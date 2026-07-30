import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { customerCreditRiskLevels } from '@nova/shared-types';

import { CustomerCreditService, type CustomerCreditExposureInput } from './customer-credit.service';

@ApiTags('Customer Credit')
@Controller({
  path: 'customer-credit',
  version: '1',
})
export class CustomerCreditController {
  constructor(private readonly customerCreditService: CustomerCreditService) {}

  @Get()
  getFoundation() {
    return {
      items: [],
      riskLevels: customerCreditRiskLevels,
    };
  }

  @Post('preview')
  preview(@Body() body: CustomerCreditExposureInput) {
    return this.customerCreditService.summarize(body);
  }
}
