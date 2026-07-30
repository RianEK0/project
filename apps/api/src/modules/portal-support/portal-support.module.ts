import { Module } from '@nestjs/common';

import { PortalSupportController } from './portal-support.controller';

@Module({
  controllers: [PortalSupportController],
})
export class PortalSupportModule {}
