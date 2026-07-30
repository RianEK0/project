import { Module } from '@nestjs/common';

import { PricingCalculatorService } from './pricing-calculator.service';

@Module({
  providers: [PricingCalculatorService],
  exports: [PricingCalculatorService],
})
export class PricingModule {}
