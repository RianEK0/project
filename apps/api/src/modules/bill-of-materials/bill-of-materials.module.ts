import { Module } from '@nestjs/common';

import { BillOfMaterialsController } from './bill-of-materials.controller';
import { BomExplosionService } from './bom-explosion.service';

@Module({
  controllers: [BillOfMaterialsController],
  providers: [BomExplosionService],
})
export class BillOfMaterialsModule {}
