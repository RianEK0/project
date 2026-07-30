import { Module } from '@nestjs/common';

import { NovaOsController } from './nova-os.controller';
import { NovaOsService } from './nova-os.service';

@Module({
  controllers: [NovaOsController],
  providers: [NovaOsService],
})
export class NovaOsModule {}
