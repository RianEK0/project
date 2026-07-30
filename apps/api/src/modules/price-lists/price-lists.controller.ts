import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { priceListStatuses, priceListTypes } from '@nova/shared-types';

@ApiTags('Price Lists')
@Controller({
  path: 'price-lists',
  version: '1',
})
export class PriceListsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      types: priceListTypes,
      statuses: priceListStatuses,
    };
  }
}
