import { Module } from '@nestjs/common';

import { AiDocumentOcrController } from './ai-document-ocr.controller';
import { AiDocumentOcrService } from './ai-document-ocr.service';

@Module({
  controllers: [AiDocumentOcrController],
  providers: [AiDocumentOcrService],
})
export class AiDocumentOcrModule {}
