import { Module } from '@nestjs/common';

import { GeneralLedgerController } from './general-ledger.controller';

@Module({
  controllers: [GeneralLedgerController],
})
export class GeneralLedgerModule {}
