import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { accountingVoucherStatuses } from '@nova/shared-types';

@ApiTags('Accounting Vouchers')
@Controller({
  path: 'accounting-vouchers',
  version: '1',
})
export class AccountingVouchersController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: accountingVoucherStatuses,
      voucherTypes: ['PAYMENT', 'RECEIPT', 'ADJUSTMENT', 'ACCRUAL', 'PETTY_CASH'],
    };
  }
}
