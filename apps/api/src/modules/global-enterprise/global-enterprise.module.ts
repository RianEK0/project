import { Module } from '@nestjs/common';

import { GlobalEnterpriseController } from './global-enterprise.controller';
import { GlobalEnterpriseService } from './global-enterprise.service';

@Module({
  controllers: [GlobalEnterpriseController],
  providers: [GlobalEnterpriseService],
})
export class GlobalEnterpriseModule {}
