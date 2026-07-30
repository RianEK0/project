import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { currencyStatuses } from '@nova/shared-types';

@ApiTags('Currencies')
@Controller({
  path: 'currencies',
  version: '1',
})
export class CurrenciesController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: currencyStatuses,
      baseCurrency: 'IDR',
      supportedCodes: ['IDR', 'USD', 'SGD', 'EUR'],
    };
  }
}
