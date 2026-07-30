import { Module } from '@nestjs/common';

import { EnterpriseSecurityController } from './enterprise-security.controller';
import { EnterpriseSecurityService } from './enterprise-security.service';

@Module({
  controllers: [EnterpriseSecurityController],
  providers: [EnterpriseSecurityService],
})
export class EnterpriseSecurityModule {}
