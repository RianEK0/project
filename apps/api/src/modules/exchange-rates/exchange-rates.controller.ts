import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { exchangeRateTypes } from '@nova/shared-types';

@ApiTags('Exchange Rates')
@Controller({
  path: 'exchange-rates',
  version: '1',
})
export class ExchangeRatesController {
  @Get()
  listFoundation() {
    return {
      items: [],
      rateTypes: exchangeRateTypes,
      rateSources: ['MANUAL', 'TREASURY_DESK', 'MONTH_END_PROCESS'],
    };
  }
}
