import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { WarehouseScanResolutionService } from './warehouse-scan-resolution.service';

@ApiTags('Warehouse Scanning')
@Controller({
  path: 'scan',
  version: '1',
})
export class WarehouseScanningController {
  constructor(private readonly warehouseScanResolutionService: WarehouseScanResolutionService) {}

  @Get('metadata')
  getMetadata() {
    return {
      supportedPrefixes: this.warehouseScanResolutionService.getSupportedPrefixes(),
      numericBarcodeFallback: true,
    };
  }

  @Get('resolve/:code')
  resolve(@Param('code') code: string) {
    return this.warehouseScanResolutionService.resolve(code);
  }
}
