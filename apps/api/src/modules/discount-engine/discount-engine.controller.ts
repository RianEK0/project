import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { discountRuleTypes, discountTargets } from '@nova/shared-types';

import {
  DiscountEngineService,
  type DiscountEngineLineInput,
  type DiscountEngineRule,
} from './discount-engine.service';

@ApiTags('Discount Engine')
@Controller({
  path: 'discount-engine',
  version: '1',
})
export class DiscountEngineController {
  constructor(private readonly discountEngineService: DiscountEngineService) {}

  @Get('metadata')
  getMetadata() {
    return {
      ruleTypes: discountRuleTypes,
      targets: discountTargets,
    };
  }

  @Post('evaluate')
  evaluate(
    @Body()
    body: {
      lines: DiscountEngineLineInput[];
      rules: DiscountEngineRule[];
    },
  ) {
    return this.discountEngineService.evaluate(body.lines ?? [], body.rules ?? []);
  }
}
