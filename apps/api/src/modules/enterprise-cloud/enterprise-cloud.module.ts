import { Module } from '@nestjs/common';

import { EnterpriseCloudController } from './enterprise-cloud.controller';
import { EnterpriseCloudService } from './enterprise-cloud.service';

@Module({
  controllers: [EnterpriseCloudController],
  providers: [EnterpriseCloudService],
})
export class EnterpriseCloudModule {}
