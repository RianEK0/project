import { Module } from '@nestjs/common';

import { AiDocumentReviewController } from './ai-document-review.controller';
import { AiDocumentReviewService } from './ai-document-review.service';

@Module({
  controllers: [AiDocumentReviewController],
  providers: [AiDocumentReviewService],
})
export class AiDocumentReviewModule {}
