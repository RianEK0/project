import { Module } from '@nestjs/common';

import { DocumentFormatsService } from './document-formats.service';
import { DocumentGovernanceService } from './document-governance.service';
import { DocumentRecordsService } from './document-records.service';
import { DocumentsWorkspaceController } from './documents-workspace.controller';

@Module({
  controllers: [DocumentsWorkspaceController],
  providers: [DocumentFormatsService, DocumentRecordsService, DocumentGovernanceService],
})
export class DocumentsWorkspaceModule {}
