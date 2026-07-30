import { Module } from '@nestjs/common';

import { PortalProfileController } from './portal-profile.controller';

@Module({
  controllers: [PortalProfileController],
})
export class PortalProfileModule {}
