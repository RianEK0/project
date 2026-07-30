import { Module } from '@nestjs/common';

import { MrpController } from './mrp.controller';
import { MrpNetRequirementService } from './mrp-net-requirement.service';

@Module({
  controllers: [MrpController],
  providers: [MrpNetRequirementService],
})
export class MrpModule {}
