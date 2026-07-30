import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { depreciationMethods, fixedAssetCategories, fixedAssetStatuses } from '@nova/shared-types';

@ApiTags('Fixed Assets')
@Controller({
  path: 'fixed-assets',
  version: '1',
})
export class FixedAssetsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: fixedAssetStatuses,
      categories: fixedAssetCategories,
      depreciationMethods,
    };
  }
}
