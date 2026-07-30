import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { installmentFrequencies, installmentPlanStatuses } from '@nova/shared-types';

import { InstallmentPlanService, type InstallmentPlanInput } from './installment-plan.service';

@ApiTags('Installments')
@Controller({
  path: 'installments',
  version: '1',
})
export class InstallmentsController {
  constructor(private readonly installmentPlanService: InstallmentPlanService) {}

  @Get()
  getFoundation() {
    return {
      items: [],
      statuses: installmentPlanStatuses,
      frequencies: installmentFrequencies,
    };
  }

  @Post('preview')
  preview(@Body() body: InstallmentPlanInput) {
    return this.installmentPlanService.preview(body);
  }
}
