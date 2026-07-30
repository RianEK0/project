import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { taxCalculationModes } from '@nova/shared-types';

import { TaxEngineService, type TaxEngineLineInput } from './tax-engine.service';

@ApiTags('Tax Engine')
@Controller({
  path: 'tax-engine',
  version: '1',
})
export class TaxEngineController {
  constructor(private readonly taxEngineService: TaxEngineService) {}

  @Get('metadata')
  getMetadata() {
    return {
      modes: taxCalculationModes,
    };
  }

  @Post('evaluate')
  evaluate(@Body() body: { lines: TaxEngineLineInput[] }) {
    return this.taxEngineService.evaluate(body.lines ?? []);
  }
}
