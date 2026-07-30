import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { payrollStatuses } from '@nova/shared-types';

import { PayrollCycleService } from './payroll-cycle.service';

@ApiTags('Payroll')
@Controller({
  path: 'payroll',
  version: '1',
})
export class PayrollController {
  constructor(private readonly payrollCycleService: PayrollCycleService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: payrollStatuses,
      frequencies: this.payrollCycleService.getSupportedFrequencies(),
      controlPoints: this.payrollCycleService.getControlPoints(),
    };
  }

  @Get('preview-run')
  getPreviewRun() {
    return this.payrollCycleService.previewRun({
      employeeCount: 48,
      frequency: 'MONTHLY',
      baseSalaryTotal: 480000000,
      allowanceTotal: 24000000,
      deductionTotal: 6000000,
      periodStart: '2026-07-01',
      periodEnd: '2026-07-31',
    });
  }
}
