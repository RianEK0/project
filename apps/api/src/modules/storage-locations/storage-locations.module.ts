import { Module } from '@nestjs/common';

import { StorageLocationTreeService } from './storage-location-tree.service';

@Module({
  providers: [StorageLocationTreeService],
  exports: [StorageLocationTreeService],
})
export class StorageLocationsModule {}
